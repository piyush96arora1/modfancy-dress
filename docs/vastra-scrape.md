# Vastra storefront scraper

`scripts/vastra-scrape.mjs` maps a [Vastra App](https://vastra.app) storefront into a single
JSON database plus a local image mirror. Built against
`https://vastra.app/puranchandharshgupta`.

```bash
npm run scrape:vastra                               # full crawl (metadata + images)
node scripts/vastra-scrape.mjs --report             # print coverage, fetch nothing
node scripts/vastra-scrape.mjs --retry-failed       # retry only what previously failed
```

Output lands in `vastra-data/` (gitignored):

| Path | Contents |
|---|---|
| `db.json` | the whole database — org, categories, products, image index, cursors, coverage |
| `failures.json` | ledger of everything that could not be fetched, with attempt counts |
| `images/…` | image mirror, laid out to match the CDN path (`design/`, `designThumbnail/`, `designCategory/`, …) |
| `scrape.log` | append-only run log |

## How the site works

The storefront is a client-side React app; every page is rendered from four API calls.
Auth is three static headers hardcoded in the public JS bundle — no login, no cookies:

```
api-key: va$Tra@pP
UDID: <digits of the User-Agent string>
device-type: Chrome: 145.0.0.0
```

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `store/web-get-org-info/<store>` | GET | — | org name, logo, address, phone, store settings, `organization_id` |
| `store/web-get-all-category/<store>/<parentId>` | POST | `{customer_id, search_string}` | categories under `parentId` (`0` = root) |
| `store/web-get-all-designs/<store>` | POST | `{category_id, child_category_id, sort_by, …}` | product listing; `category_id: 0` = whole catalogue |
| `store/web-get-product-info-common/<store>/<designId>` | POST | `{categoryId, customer_id, customer_category_id}` | product detail — colours, sizes, per-size rates, stock |

Pagination is server-driven: a response carries `page.next` as a relative path
(`/store/web-get-all-designs/<store>?pageno=2&datetime=…`), re-POSTed with the same body
until `page.next` is absent. Categories page at 10/request, designs at 30/request.

Useful quirks the scraper relies on or works around:

- `total_products` rides along on listing rows and is the expected count for that scope —
  that is where the coverage numbers come from. `total_categories` does the same for the root
  category call.
- `child_category_count` says whether a category has children, so the tree walk only
  descends where children exist.
- A category with no image returns a bare directory URL
  (`https://media.vastraapp.com/designCategory/`). These are skipped rather than recorded as
  broken images.
- Listing a **parent** category returns its descendants' products too, so per-category
  counts sum to more than the catalogue total. Dedup is by `design_id`.
- **A parent listing is not complete.** For the four parents that have children, the parent's
  own paginated listing returns fewer products than its own `total_products` claims — 16
  products in total are reachable only through their child category or the global listing
  (e.g. `Accessories Mix` lists 230 but reports 237, and the 7 missing ones show up under its
  children). This is why the scraper crawls the global listing *and* every category rather
  than trusting the tree: the union across all listings is exactly the 827 the API reports,
  with every product appearing in at least one of them.

## db.json structure

```jsonc
{
  "meta": {
    "schema_version": 1,
    "store_slug": "puranchandharshgupta",
    "store_url": "https://vastra.app/puranchandharshgupta",
    "first_run_at": "…", "last_run_at": "…",
    "runs": [ { "started_at", "finished_at", "phases", "products_known", "failures_open" } ],
    "coverage": { /* see below */ }
  },

  "organization": { "organization_id": 162979, "organization_name": "…", "address": "…",
                    "organization_contact_number": "…", "whatsapp_url": "…",
                    "organization_logo": "…", "store_json": { /* store display settings */ } },

  "categories": {
    "<category_id>": {
      "category_id": 38822, "category_name": "Garbha lehenge",
      "parent_category_id": 0, "child_category_count": 0, "child_ids": [],
      "path": ["costumes", "cartoon"],            // root -> leaf, human readable
      "image": "…", "thumbnail_url": "…",
      "item_index_no": 13, "status": 1, "is_private": 0,
      "crawl": {                                  // per-category tracking
        "pages": 3, "next": null, "complete": true,
        "expected_total": 40,                     // what the API said this category holds
        "design_ids": ["<uuid>", …]               // what was actually listed
      }
    }
  },

  "products": {
    "<design_id>": {
      "design_id": "7a945586-…",
      "category_ids": ["37733"],
      "seen_in": ["global", "37733", "37286"],    // which listings surfaced it
      "image_urls": ["https://media.vastraapp.com/design/…jpeg"],
      "thumbnail_urls": ["https://media.vastraapp.com/designThumbnail/…jpeg"],
      "listing": {                                // from web-get-all-designs
        "design_number": "DES-gajra", "design_price": 180, "design_notes": "",
        "category_id": 37733, "category_name": "mala & kundal",
        "set_value": 1, "minimum_order_qty": 0, "design_tags": "",
        "total_stock": 0, "is_exclusive": false, "item_index_no": 32
      },
      "detail": {                                 // from web-get-product-info-common
        "sale_price": 180, "is_size": 0, "all_tags": "", "categories": "mala & kundal",
        "is_stock_available": 1,
        "color_size_data": [ { "color_id": "701", "color_name": "No Color",
          "size_info": [ { "size_id": "0", "size_name": "Default", "size_rate": 0,
                           "total_stock": 0, "is_stock_available": 1 } ] } ]
      },
      "detail_fetched_at": "…"
    }
  },

  "images": {
    "<url>": {
      "kind": "design_image | design_thumbnail | category_image | category_thumbnail | organization_logo | banner",
      "local_path": "images/design/162979_…jpeg",  // relative to vastra-data/
      "status": "pending | downloaded | failed",
      "bytes": 84213, "content_type": "image/jpeg",
      "attempts": 0, "error": null, "downloaded_at": "…",
      "refs": { "design_ids": ["…"] }              // trace an image back to what uses it
    }
  },

  "cursors": {                                     // resume bookmarks
    "categories":     { "queue": [], "visited": ["0", "37655", …], "done": true },
    "designs_global": { "next": null, "pages": 29, "expected_total": 827, "done": true }
  }
}
```

### Pricing fields

- `listing.design_price` — the catalogue price shown on tiles.
- `detail.sale_price` — the price on the product page (same value in practice).
- `detail.color_size_data[].size_info[].size_rate` — per-size override; `0` means no override.
- `listing.set_value` and `minimum_order_qty` — how the item is sold (set size / MOQ).

### Coverage — "how far did we get, and where"

`meta.coverage` is recomputed on every save, so `db.json` always states its own completeness:

- `categories` — discovered, how many are fully listed, which are not, whether the tree walk finished.
- `products` — `expected_total_from_api` vs `collected`, how many have detail, how many are
  uncategorised, plus `global_resume_next` (the exact page to resume from).
- `images` — known / downloaded / pending / failed, bytes on disk, broken down by kind.
- `per_category[]` — one row per category: `path`, `expected_products`, `products_listed`,
  `products_with_detail`, `pages_fetched`, `resume_next`, `listing_complete`.

`--report` prints this as a table without making a single request.

## Fault tolerance

- **Retries with backoff.** Every request retries up to `--retries` (default 5) with
  exponential backoff (1s → 30s cap) plus jitter, honouring `Retry-After`. Retries fire on
  network errors, timeouts, 408/425/429 and 5xx. A hard 4xx fails immediately — retrying it
  would not help.
- **Failure ledger.** Anything still failing after its retries is written to
  `failures.json` with phase, key, HTTP status, error text, cumulative `attempts`, `runs`,
  and enough context to resume (`resume_next`, `category_id`, `design_id`). The run
  continues; one bad product never aborts the crawl. Each run ends with an automatic second
  pass over whatever it just logged.
- **Resumable.** `db.json` is the source of truth for what exists; on-disk files are the
  source of truth for images. Re-running skips completed work and continues paginating from
  the stored cursor. Interrupted listings resume mid-category, not from page 1.
- **Images are verified, not assumed.** Every image-phase run stats each recorded file and
  re-fetches anything missing or whose size disagrees with the stored byte count, so a file
  deleted or truncated after the fact is repaired instead of being trusted forever.
- **Crash-safe writes.** `db.json` and `failures.json` are written to a temp file and
  renamed, keeping a `.bak`; a truncated file falls back to the backup. State is flushed
  every `--save-every` items (default 25) and on SIGINT/SIGTERM, so Ctrl-C is safe.
- **Loop guards.** Pagination stops on a repeated `next` URL or at `--max-pages`.

## Options

| Flag | Default | Meaning |
|---|---|---|
| `--store=<slug>` | `puranchandharshgupta` | storefront to crawl |
| `--out=<dir>` | `vastra-data` | output directory |
| `--phases=a,b,c` | all | `org,categories,designs,details,images` |
| `--images=<mode>` | `all` | `all` / `full` / `thumbs` / `none` (URLs are recorded either way) |
| `--concurrency=N` | `5` | parallel requests |
| `--retries=N` | `5` | attempts per request |
| `--timeout=ms` | `45000` | per-request timeout |
| `--delay=ms` | `120` | pause between requests inside a worker |
| `--save-every=N` | `25` | flush state every N items |
| `--max-pages=N` | `500` | pagination guard |
| `--limit-details=N` | `0` | cap detail fetches (smoke tests) |
| `--retry-failed` | off | retry only the failure ledger |
| `--report` | off | print coverage and exit |

## Re-running later

The crawl is incremental, so a later run picks up new products and categories:

```bash
node scripts/vastra-scrape.mjs --report            # what do we have?
node scripts/vastra-scrape.mjs --retry-failed      # heal any gaps first
node scripts/vastra-scrape.mjs                     # then crawl forward
```

To force a re-listing (e.g. to pick up new products in a category), set that category's
`crawl.complete` to `false` — or `cursors.designs_global.done` to `false` for the whole
catalogue — and re-run. Existing products and images are left untouched.
