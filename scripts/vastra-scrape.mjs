#!/usr/bin/env node
/**
 * vastra-scrape.mjs — maps a Vastra App storefront into a single JSON database.
 *
 * The storefront (https://vastra.app/<store>) is a client-side React app that talks
 * to https://vastraapp.com/api/v2. Auth is three static headers baked into the public
 * JS bundle (api-key / UDID / device-type), so no login is involved.
 *
 * Endpoints used:
 *   GET  store/web-get-org-info/<store>                        -> org + store settings
 *   POST store/web-get-all-category/<store>/<parentId>         -> category tree (parentId 0 = root)
 *   POST store/web-get-all-designs/<store>                     -> product listing (category_id 0 = all)
 *   POST store/web-get-product-info-common/<store>/<designId>  -> product detail (colors/sizes/stock)
 *
 * Pagination is server-driven: responses carry page.next as a relative path that is
 * re-POSTed with the same body until it is absent.
 *
 * Everything is resumable. db.json is the source of truth for what has been collected,
 * failures.json is the ledger of what could not be collected, and both are written
 * atomically so an interrupted run never corrupts them. Re-running picks up where the
 * last run stopped and retries whatever is in the failure ledger.
 *
 * Usage:
 *   node scripts/vastra-scrape.mjs                              # full crawl, images included
 *   node scripts/vastra-scrape.mjs --phases=org,categories,designs,details
 *   node scripts/vastra-scrape.mjs --images=thumbs --concurrency=4
 *   node scripts/vastra-scrape.mjs --retry-failed                # only retry the failure ledger
 *   node scripts/vastra-scrape.mjs --report                      # print coverage, fetch nothing
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SCHEMA_VERSION = 1;
const API_BASE = 'https://vastraapp.com/api/v2';
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';

// Exactly what the storefront bundle sends. UDID is the digit-run of the UA string.
const API_HEADERS = {
  'api-key': 'va$Tra@pP',
  UDID: UA.replace(/\D+/g, ''),
  'device-type': 'Chrome: 145.0.0.0',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  'User-Agent': UA,
  Origin: 'https://vastra.app',
  Referer: 'https://vastra.app/',
};

const ALL_PHASES = ['org', 'categories', 'designs', 'details', 'images'];

function parseArgs(argv) {
  const opts = {
    store: 'puranchandharshgupta',
    out: 'vastra-data',
    phases: ALL_PHASES,
    images: 'all', // all | full | thumbs | none
    concurrency: 5,
    retries: 5,
    timeout: 45000,
    delay: 120, // polite pause between requests within a worker, ms
    saveEvery: 25,
    maxPages: 500, // pagination loop guard
    limitDetails: 0, // 0 = no limit (useful for smoke tests)
    retryFailed: false,
    report: false,
  };
  for (const arg of argv) {
    const m = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!m) throw new Error(`Unrecognised argument: ${arg}`);
    const [, key, raw] = m;
    switch (key) {
      case 'store': opts.store = raw; break;
      case 'out': opts.out = raw; break;
      case 'phases': opts.phases = raw.split(',').map((s) => s.trim()).filter(Boolean); break;
      case 'images': opts.images = raw; break;
      case 'concurrency': opts.concurrency = Number(raw); break;
      case 'retries': opts.retries = Number(raw); break;
      case 'timeout': opts.timeout = Number(raw); break;
      case 'delay': opts.delay = Number(raw); break;
      case 'save-every': opts.saveEvery = Number(raw); break;
      case 'max-pages': opts.maxPages = Number(raw); break;
      case 'limit-details': opts.limitDetails = Number(raw); break;
      case 'retry-failed': opts.retryFailed = true; break;
      case 'report': opts.report = true; break;
      default: throw new Error(`Unknown option: --${key}`);
    }
  }
  const bad = opts.phases.filter((p) => !ALL_PHASES.includes(p));
  if (bad.length) throw new Error(`Unknown phase(s): ${bad.join(', ')}. Valid: ${ALL_PHASES.join(', ')}`);
  if (!['all', 'full', 'thumbs', 'none'].includes(opts.images)) {
    throw new Error(`--images must be one of all|full|thumbs|none`);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

const OUT_DIR = path.resolve(opts.out);
const DB_PATH = path.join(OUT_DIR, 'db.json');
const FAIL_PATH = path.join(OUT_DIR, 'failures.json');
const IMG_DIR = path.join(OUT_DIR, 'images');
const LOG_PATH = path.join(OUT_DIR, 'scrape.log');

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

let logStream = null;
function log(level, msg) {
  const line = `${new Date().toISOString()} [${level}] ${msg}`;
  if (level === 'ERROR' || level === 'WARN') console.error(line);
  else console.log(line);
  logStream?.write(line + '\n');
}
const info = (m) => log('INFO', m);
const warn = (m) => log('WARN', m);
const error = (m) => log('ERROR', m);

// ---------------------------------------------------------------------------
// Atomic JSON persistence
// ---------------------------------------------------------------------------

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    // A truncated file means a previous run died mid-write. Prefer the .bak.
    warn(`${path.basename(file)} unreadable (${err.message}); trying backup`);
    try {
      return JSON.parse(await fsp.readFile(file + '.bak', 'utf8'));
    } catch {
      warn(`No usable backup for ${path.basename(file)}; starting fresh`);
      return fallback;
    }
  }
}

async function writeJsonAtomic(file, data) {
  const tmp = `${file}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
  try {
    await fsp.copyFile(file, file + '.bak');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  await fsp.rename(tmp, file);
}

// ---------------------------------------------------------------------------
// State: db + failure ledger
// ---------------------------------------------------------------------------

function emptyDb() {
  return {
    meta: {
      schema_version: SCHEMA_VERSION,
      store_slug: opts.store,
      store_url: `https://vastra.app/${opts.store}`,
      api_base: API_BASE,
      first_run_at: null,
      last_run_at: null,
      runs: [],
      coverage: null,
    },
    organization: null,
    // category_id -> { ...api fields, path, child_ids, crawl: {...} }
    categories: {},
    // design_id -> { listing, detail, category_ids, image_urls, thumbnail_urls }
    products: {},
    // url -> { kind, local_path, status, bytes, content_type, attempts, error }
    images: {},
    // pagination bookmarks so an interrupted listing resumes mid-way
    cursors: {
      categories: { queue: [], visited: [], done: false },
      designs_global: { next: null, pages: 0, expected_total: null, done: false },
    },
  };
}

let db = emptyDb();
let failures = { schema_version: SCHEMA_VERSION, entries: {} };
let dirty = 0;
let flushing = null;

/** Records a permanent failure so the next run knows exactly what to retry. */
function recordFailure(phase, key, err, extra = {}) {
  const id = `${phase}:${key}`;
  const prev = failures.entries[id];
  failures.entries[id] = {
    phase,
    key,
    ...extra,
    attempts: (prev?.attempts ?? 0) + (err.attempts ?? 1),
    runs: (prev?.runs ?? 0) + 1,
    last_error: err.message ?? String(err),
    last_status: err.status ?? null,
    first_failed_at: prev?.first_failed_at ?? new Date().toISOString(),
    last_failed_at: new Date().toISOString(),
  };
  error(`FAILED ${id} :: ${err.message ?? err}`);
}

function clearFailure(phase, key) {
  delete failures.entries[`${phase}:${key}`];
}

async function flush(force = false) {
  if (!force && ++dirty < opts.saveEvery) return;
  if (flushing) return flushing; // never interleave two writes
  dirty = 0;
  flushing = (async () => {
    db.meta.coverage = computeCoverage();
    await writeJsonAtomic(DB_PATH, db);
    await writeJsonAtomic(FAIL_PATH, failures);
  })();
  try {
    await flushing;
  } finally {
    flushing = null;
  }
}

// ---------------------------------------------------------------------------
// HTTP with retry + exponential backoff
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function retryable(status) {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status < 600);
}

function backoffMs(attempt) {
  // 1s, 2s, 4s, 8s, 16s ... capped, with jitter to avoid lockstep retries
  const base = Math.min(1000 * 2 ** (attempt - 1), 30000);
  return base + Math.floor(Math.random() * 400);
}

/**
 * Fetches with retries. Throws an Error carrying .status and .attempts when every
 * attempt is exhausted or the failure is not retryable.
 */
async function fetchWithRetry(url, init, { retries = opts.retries, label = url } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(opts.timeout) });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        const err = new Error(`HTTP ${res.status} ${res.statusText} :: ${body.slice(0, 200)}`);
        err.status = res.status;
        if (!retryable(res.status)) {
          err.attempts = attempt;
          throw err;
        }
        lastErr = err;
        const retryAfter = Number(res.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt);
        if (attempt < retries) {
          warn(`${label} -> ${res.status}; retry ${attempt}/${retries - 1} in ${wait}ms`);
          await sleep(wait);
          continue;
        }
      } else {
        return res;
      }
    } catch (err) {
      if (err.status && !retryable(err.status)) throw err; // hard 4xx: give up now
      lastErr = err;
      if (attempt < retries) {
        const wait = backoffMs(attempt);
        warn(`${label} -> ${err.message}; retry ${attempt}/${retries - 1} in ${wait}ms`);
        await sleep(wait);
      }
    }
  }
  lastErr.attempts = retries;
  throw lastErr;
}

/** Calls the Vastra API. `pathOrNext` may be a bare path or a server-supplied next path. */
async function api(pathOrNext, { method = 'POST', body = null } = {}) {
  const rel = pathOrNext.startsWith('/') ? pathOrNext : `/${pathOrNext}`;
  const url = `${API_BASE}${rel}`;
  const init = { method, headers: API_HEADERS };
  if (method !== 'GET') init.body = JSON.stringify(body ?? {});

  const res = await fetchWithRetry(url, init, { label: rel });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    const err = new Error(`Non-JSON response: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  if (json.status === false) {
    const err = new Error(`API error ${json.error?.code ?? '?'}: ${json.error?.message ?? 'unknown'}`);
    err.status = res.status;
    throw err;
  }
  if (opts.delay) await sleep(opts.delay);
  return json;
}

/** Walks a server-paginated endpoint, invoking onPage for each page. */
async function paginate(firstPath, body, onPage, { label, startNext = null, startPage = 0 } = {}) {
  let next = startNext ?? firstPath;
  let pages = startPage;
  const seen = new Set();
  while (next) {
    if (seen.has(next)) {
      warn(`${label}: pagination loop detected at ${next}; stopping`);
      break;
    }
    seen.add(next);
    if (pages >= opts.maxPages) {
      warn(`${label}: hit --max-pages=${opts.maxPages}; stopping`);
      break;
    }
    const json = await api(next, { body });
    pages++;
    const rows = Array.isArray(json.data) ? json.data : [];
    const nextPath = json.page?.next ?? null;
    await onPage(rows, { pages, next: nextPath });
    next = nextPath;
  }
  return { pages, complete: !next };
}

// ---------------------------------------------------------------------------
// Concurrency pool
// ---------------------------------------------------------------------------

async function pool(items, limit, worker) {
  const queue = [...items.entries()];
  let done = 0;
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;
      const [i, item] = entry;
      await worker(item, i);
      done++;
      if (done % 25 === 0) info(`  ...${done}/${items.length}`);
    }
  });
  await Promise.all(runners);
}

// ---------------------------------------------------------------------------
// Phase: organization
// ---------------------------------------------------------------------------

async function phaseOrg() {
  info('Phase org: fetching store/organization info');
  try {
    const json = await api(`/store/web-get-org-info/${opts.store}`, { method: 'GET' });
    db.organization = { ...json.data, fetched_at: new Date().toISOString() };
    if (json.data?.organization_logo) registerImage(json.data.organization_logo, 'organization_logo');
    for (const b of json.data?.store_json?.bannerImages ?? []) {
      if (typeof b === 'string') registerImage(b, 'banner');
      else if (b?.image) registerImage(b.image, 'banner');
    }
    clearFailure('org', opts.store);
    info(`  org ${db.organization.organization_name} (id ${db.organization.organization_id})`);
  } catch (err) {
    recordFailure('org', opts.store, err, { url: `/store/web-get-org-info/${opts.store}` });
  }
  await flush(true);
}

// ---------------------------------------------------------------------------
// Phase: category tree
// ---------------------------------------------------------------------------

function categoryPath(id) {
  const parts = [];
  let cur = db.categories[String(id)];
  const guard = new Set();
  while (cur && !guard.has(String(cur.category_id))) {
    guard.add(String(cur.category_id));
    parts.unshift(cur.category_name);
    const parent = cur.parent_category_id;
    cur = parent && String(parent) !== '0' ? db.categories[String(parent)] : null;
  }
  return parts;
}

async function phaseCategories() {
  info('Phase categories: walking the category tree from root');
  const cur = db.cursors.categories;
  const visited = new Set(cur.visited.map(String));
  // Resume an interrupted walk, otherwise start at the synthetic root (parent 0).
  const queue = cur.queue.length || visited.size ? [...cur.queue] : [{ parentId: '0', next: null, pages: 0 }];

  while (queue.length) {
    const job = queue.shift();
    const parentId = String(job.parentId);
    if (visited.has(parentId)) continue;

    const label = `categories/${parentId}`;
    try {
      const { complete } = await paginate(
        `/store/web-get-all-category/${opts.store}/${parentId}`,
        { customer_id: '', search_string: '' },
        async (rows, { next }) => {
          for (const row of rows) {
            const id = String(row.category_id);
            const prev = db.categories[id] ?? {};
            db.categories[id] = {
              ...prev,
              ...row,
              parent_category_id: row.parent_category_id ?? Number(parentId),
              path: [],
              child_ids: prev.child_ids ?? [],
              crawl: prev.crawl ?? {
                next: null,
                pages: 0,
                expected_total: null,
                design_ids: [],
                complete: false,
              },
              fetched_at: new Date().toISOString(),
            };
            if (row.image) registerImage(row.image, 'category_image', { category_id: id });
            if (row.thumbnail_url) registerImage(row.thumbnail_url, 'category_thumbnail', { category_id: id });
            if (parentId !== '0') {
              const p = db.categories[parentId];
              if (p && !p.child_ids.includes(id)) p.child_ids.push(id);
            }
            // Only descend where the API says children exist.
            if (Number(row.child_category_count) > 0 && !visited.has(id)) {
              queue.push({ parentId: id, next: null, pages: 0 });
            }
          }
          // Persist the bookmark before the next page so a crash resumes here.
          cur.queue = [{ parentId, next, pages: 0 }, ...queue];
          await flush();
        },
        { label, startNext: job.next, startPage: job.pages },
      );
      if (complete) {
        visited.add(parentId);
        cur.visited = [...visited];
        clearFailure('categories', parentId);
      }
    } catch (err) {
      recordFailure('categories', parentId, err, { parent_category_id: parentId });
      visited.add(parentId); // don't wedge the walk; the ledger holds the retry
      cur.visited = [...visited];
    }
    cur.queue = [...queue];
    await flush();
  }

  for (const id of Object.keys(db.categories)) db.categories[id].path = categoryPath(id);
  cur.done = failures.entries && !Object.keys(failures.entries).some((k) => k.startsWith('categories:'));
  cur.queue = [];
  await flush(true);
  info(`  ${Object.keys(db.categories).length} categories discovered`);
}

// ---------------------------------------------------------------------------
// Phase: design (product) listings
// ---------------------------------------------------------------------------

function designListingBody(categoryId) {
  // Mirrors the payload the storefront sends; category_id 0 means "everything".
  return {
    category_id: categoryId,
    child_category_id: 0,
    customer_id: '',
    search_string: '',
    customer_category_id: '',
    sort_by: 0,
    filter_tag: 0,
    min_price: '',
    max_price: '',
    tag_ids: '',
    color_ids: '',
    size_ids: '',
    is_stock: 2,
    is_greater_than: 0,
    greater_than_value: '',
    is_less_than: 0,
    less_than_value: '',
  };
}

function upsertDesign(row, categoryId) {
  const id = row.design_id;
  if (!id) return;
  const prev = db.products[id] ?? {
    design_id: id,
    listing: null,
    detail: null,
    detail_fetched_at: null,
    category_ids: [],
    image_urls: [],
    thumbnail_urls: [],
    seen_in: [],
  };
  prev.listing = { ...(prev.listing ?? {}), ...row };
  const catId = String(row.category_id ?? categoryId ?? '');
  if (catId && catId !== '0' && !prev.category_ids.includes(catId)) prev.category_ids.push(catId);
  const src = String(categoryId ?? 'global');
  if (!prev.seen_in.includes(src)) prev.seen_in.push(src);

  for (const url of row.design_images ?? []) {
    if (!isUsableImageUrl(url)) continue;
    if (!prev.image_urls.includes(url)) prev.image_urls.push(url);
    registerImage(url, 'design_image', { design_id: id });
  }
  for (const url of row.design_images_thumbnail ?? []) {
    if (!isUsableImageUrl(url)) continue;
    if (!prev.thumbnail_urls.includes(url)) prev.thumbnail_urls.push(url);
    registerImage(url, 'design_thumbnail', { design_id: id });
  }
  db.products[id] = prev;
}

async function crawlDesignList({ categoryId, cursor, label }) {
  const body = designListingBody(categoryId === 'global' ? 0 : Number(categoryId));
  const collected = new Set(cursor.design_ids ?? []);
  const { complete } = await paginate(
    `/store/web-get-all-designs/${opts.store}`,
    body,
    async (rows, { pages, next }) => {
      for (const row of rows) {
        upsertDesign(row, categoryId === 'global' ? null : categoryId);
        collected.add(row.design_id);
        // total_products rides along on the rows; it is the expected count for this scope.
        if (cursor.expected_total == null && Number.isFinite(row.total_products)) {
          cursor.expected_total = row.total_products;
        }
      }
      cursor.next = next;
      cursor.pages = pages;
      cursor.design_ids = [...collected];
      await flush();
    },
    { label, startNext: cursor.next, startPage: cursor.pages ?? 0 },
  );
  cursor.complete = complete;
  cursor.design_ids = [...collected];
  return collected.size;
}

async function phaseDesigns() {
  // 1) Global listing — the authoritative product count and the widest net.
  const g = db.cursors.designs_global;
  if (!g.done) {
    info('Phase designs: global listing (category_id=0)');
    try {
      const n = await crawlDesignList({ categoryId: 'global', cursor: g, label: 'designs/global' });
      g.done = g.complete;
      clearFailure('designs', 'global');
      info(`  global listing: ${n} designs across ${g.pages} pages (expected ${g.expected_total ?? '?'})`);
    } catch (err) {
      recordFailure('designs', 'global', err, { resume_next: g.next, pages_done: g.pages });
    }
    await flush(true);
  } else {
    info(`Phase designs: global listing already complete (${g.design_ids?.length ?? 0} designs)`);
  }

  // 2) Per-category listings — gives the category -> product mapping and a per-category
  //    expected count, so coverage can be reported category by category.
  const catIds = Object.keys(db.categories).filter((id) => !db.categories[id].crawl?.complete);
  info(`Phase designs: per-category listings (${catIds.length} categories pending)`);
  await pool(catIds, opts.concurrency, async (id) => {
    const cat = db.categories[id];
    try {
      const n = await crawlDesignList({
        categoryId: id,
        cursor: cat.crawl,
        label: `designs/cat-${id}`,
      });
      clearFailure('designs', `cat-${id}`);
      if (cat.crawl.complete) {
        info(`  [${cat.category_name}] ${n} designs (expected ${cat.crawl.expected_total ?? '?'})`);
      }
    } catch (err) {
      recordFailure('designs', `cat-${id}`, err, {
        category_id: id,
        category_name: cat.category_name,
        resume_next: cat.crawl.next,
        pages_done: cat.crawl.pages,
      });
    }
    await flush();
  });
  await flush(true);
  info(`  ${Object.keys(db.products).length} distinct products known`);
}

// ---------------------------------------------------------------------------
// Phase: product detail
// ---------------------------------------------------------------------------

async function fetchDetail(id) {
  const p = db.products[id];
  const categoryId = Number(p.category_ids[0] ?? p.listing?.category_id ?? 0) || 0;
  const json = await api(`/store/web-get-product-info-common/${opts.store}/${id}`, {
    body: { categoryId, customer_id: '', customer_category_id: '' },
  });
  p.detail = json.data;
  p.detail_fetched_at = new Date().toISOString();
  for (const url of json.data?.design_images ?? []) {
    if (!isUsableImageUrl(url)) continue;
    if (!p.image_urls.includes(url)) p.image_urls.push(url);
    registerImage(url, 'design_image', { design_id: id });
  }
}

async function phaseDetails() {
  let pending = Object.keys(db.products).filter((id) => !db.products[id].detail);
  if (opts.limitDetails > 0) pending = pending.slice(0, opts.limitDetails);
  info(`Phase details: ${pending.length} products need detail`);
  await pool(pending, opts.concurrency, async (id) => {
    try {
      await fetchDetail(id);
      clearFailure('detail', id);
    } catch (err) {
      recordFailure('detail', id, err, {
        design_id: id,
        design_number: db.products[id]?.listing?.design_number ?? null,
        category_id: db.products[id]?.category_ids?.[0] ?? null,
      });
    }
    await flush();
  });
  await flush(true);
}

// ---------------------------------------------------------------------------
// Phase: images
// ---------------------------------------------------------------------------

/** media.vastraapp.com sometimes returns a bare directory URL when no image is set. */
function isUsableImageUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('http')) return false;
  const file = url.split('?')[0].split('/').pop();
  return Boolean(file && file.includes('.'));
}

function localPathFor(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  const file = parts.pop();
  const dir = parts.join('/') || 'misc';
  return path.join(IMG_DIR, dir, file);
}

function registerImage(url, kind, refs = {}) {
  if (!isUsableImageUrl(url)) return;
  const prev = db.images[url];
  if (prev) {
    // Keep every referrer so the JSON can be traced back from any image.
    for (const [k, v] of Object.entries(refs)) {
      const key = `${k}s`;
      prev.refs[key] = prev.refs[key] ?? [];
      if (v && !prev.refs[key].includes(v)) prev.refs[key].push(v);
    }
    return;
  }
  const refsOut = {};
  for (const [k, v] of Object.entries(refs)) if (v) refsOut[`${k}s`] = [v];
  db.images[url] = {
    url,
    kind,
    local_path: path.relative(OUT_DIR, localPathFor(url)),
    status: 'pending',
    bytes: null,
    content_type: null,
    attempts: 0,
    error: null,
    downloaded_at: null,
    refs: refsOut,
  };
}

function wantedImageKinds() {
  switch (opts.images) {
    case 'none': return [];
    case 'thumbs': return ['design_thumbnail', 'category_thumbnail', 'organization_logo', 'banner'];
    case 'full': return ['design_image', 'category_image', 'organization_logo', 'banner'];
    default: return null; // all
  }
}

async function downloadImage(url) {
  const rec = db.images[url];
  const dest = path.join(OUT_DIR, rec.local_path);

  // On-disk file is the real source of truth for resume. A file whose size disagrees with
  // the recorded byte count is treated as damaged and re-fetched.
  try {
    const st = await fsp.stat(dest);
    if (st.size > 0 && (rec.bytes == null || st.size === rec.bytes)) {
      rec.status = 'downloaded';
      rec.bytes = st.size;
      rec.downloaded_at = rec.downloaded_at ?? new Date().toISOString();
      rec.error = null;
      return 'skipped';
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const res = await fetchWithRetry(url, { headers: { 'User-Agent': UA, Referer: 'https://vastra.app/' } }, {
    label: `image ${path.basename(dest)}`,
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) {
    const err = new Error('Empty image body');
    err.status = res.status;
    throw err;
  }
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.part`;
  await fsp.writeFile(tmp, buf);
  await fsp.rename(tmp, dest);

  rec.status = 'downloaded';
  rec.bytes = buf.length;
  rec.content_type = res.headers.get('content-type');
  rec.downloaded_at = new Date().toISOString();
  rec.error = null;
  return 'downloaded';
}

async function phaseImages() {
  if (opts.images === 'none') {
    info('Phase images: skipped (--images=none); URLs are still recorded in db.json');
    return;
  }
  const kinds = wantedImageKinds();
  const pending = [];
  let repaired = 0;
  for (const url of Object.keys(db.images)) {
    const rec = db.images[url];
    if (kinds && !kinds.includes(rec.kind)) continue;
    if (rec.status === 'downloaded') {
      // Never trust the record alone: a file deleted or truncated since the last run
      // (crash mid-write, disk full, manual cleanup) must be fetched again.
      const dest = path.join(OUT_DIR, rec.local_path);
      let st = null;
      try {
        st = await fsp.stat(dest);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      if (st && st.size > 0 && (rec.bytes == null || st.size === rec.bytes)) continue;
      warn(
        `image ${rec.local_path} is ${st ? `${st.size}B, expected ${rec.bytes}B` : 'missing'} — re-fetching`,
      );
      rec.status = 'pending';
      repaired++;
    }
    pending.push(url);
  }
  if (repaired) info(`  ${repaired} previously-downloaded image(s) missing or damaged on disk`);
  info(`Phase images: ${pending.length} of ${Object.keys(db.images).length} images to fetch (--images=${opts.images})`);

  let downloaded = 0;
  let skipped = 0;
  await pool(pending, opts.concurrency, async (url) => {
    const rec = db.images[url];
    try {
      const result = await downloadImage(url);
      if (result === 'downloaded') downloaded++;
      else skipped++;
      clearFailure('image', url);
    } catch (err) {
      rec.status = 'failed';
      rec.attempts += err.attempts ?? 1;
      rec.error = err.message;
      recordFailure('image', url, err, { kind: rec.kind, local_path: rec.local_path, refs: rec.refs });
    }
    await flush();
  });
  await flush(true);
  info(`  images: ${downloaded} downloaded, ${skipped} already on disk`);
}

// ---------------------------------------------------------------------------
// Retry-only mode
// ---------------------------------------------------------------------------

async function retryFailedEntries() {
  const entries = Object.values(failures.entries);
  if (!entries.length) {
    info('Failure ledger is empty — nothing to retry.');
    return;
  }
  info(`Retrying ${entries.length} previously failed entries`);

  const byPhase = (p) => entries.filter((e) => e.phase === p);

  for (const e of byPhase('org')) {
    await phaseOrg();
    void e;
  }
  for (const e of byPhase('categories')) {
    db.cursors.categories.visited = db.cursors.categories.visited.filter((v) => String(v) !== String(e.key));
    db.cursors.categories.queue.push({ parentId: e.key, next: e.resume_next ?? null, pages: 0 });
  }
  if (byPhase('categories').length) await phaseCategories();

  const designEntries = byPhase('designs');
  if (designEntries.length) {
    for (const e of designEntries) {
      if (e.key === 'global') db.cursors.designs_global.done = false;
      else {
        const id = e.category_id ?? e.key.replace(/^cat-/, '');
        if (db.categories[id]) db.categories[id].crawl.complete = false;
      }
    }
    await phaseDesigns();
  }

  const detailIds = byPhase('detail').map((e) => e.key).filter((id) => db.products[id]);
  if (detailIds.length) {
    info(`Retrying ${detailIds.length} product details`);
    await pool(detailIds, opts.concurrency, async (id) => {
      try {
        await fetchDetail(id);
        clearFailure('detail', id);
      } catch (err) {
        recordFailure('detail', id, err, { design_id: id });
      }
      await flush();
    });
  }

  const imageUrls = byPhase('image').map((e) => e.key).filter((u) => db.images[u]);
  if (imageUrls.length) {
    info(`Retrying ${imageUrls.length} images`);
    await pool(imageUrls, opts.concurrency, async (url) => {
      try {
        await downloadImage(url);
        clearFailure('image', url);
      } catch (err) {
        db.images[url].status = 'failed';
        db.images[url].attempts += err.attempts ?? 1;
        db.images[url].error = err.message;
        recordFailure('image', url, err, { kind: db.images[url].kind });
      }
      await flush();
    });
  }
  await flush(true);
}

// ---------------------------------------------------------------------------
// Coverage — "how far did we get, and where"
// ---------------------------------------------------------------------------

function computeCoverage() {
  const productIds = Object.keys(db.products);
  const withDetail = productIds.filter((id) => db.products[id].detail);
  const imgs = Object.values(db.images);
  const g = db.cursors.designs_global;

  const categories = Object.keys(db.categories)
    .map((id) => {
      const c = db.categories[id];
      const listed = c.crawl?.design_ids?.length ?? 0;
      const detailed = (c.crawl?.design_ids ?? []).filter((d) => db.products[d]?.detail).length;
      return {
        category_id: id,
        category_name: c.category_name,
        path: (c.path ?? []).join(' > '),
        parent_category_id: c.parent_category_id,
        child_category_count: c.child_category_count,
        listing_complete: Boolean(c.crawl?.complete),
        pages_fetched: c.crawl?.pages ?? 0,
        resume_next: c.crawl?.next ?? null,
        expected_products: c.crawl?.expected_total ?? null,
        products_listed: listed,
        products_with_detail: detailed,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const failureCounts = {};
  for (const e of Object.values(failures.entries)) {
    failureCounts[e.phase] = (failureCounts[e.phase] ?? 0) + 1;
  }

  return {
    computed_at: new Date().toISOString(),
    organization_fetched: Boolean(db.organization),
    categories: {
      discovered: Object.keys(db.categories).length,
      listing_complete: categories.filter((c) => c.listing_complete).length,
      listing_incomplete: categories.filter((c) => !c.listing_complete).map((c) => c.category_id),
      tree_walk_complete: Boolean(db.cursors.categories.done),
    },
    products: {
      expected_total_from_api: g.expected_total ?? null,
      collected: productIds.length,
      with_detail: withDetail.length,
      missing_detail: productIds.filter((id) => !db.products[id].detail).length,
      global_listing_complete: Boolean(g.complete),
      global_pages_fetched: g.pages ?? 0,
      global_resume_next: g.next ?? null,
      uncategorised: productIds.filter((id) => db.products[id].category_ids.length === 0).length,
    },
    images: {
      known: imgs.length,
      downloaded: imgs.filter((i) => i.status === 'downloaded').length,
      pending: imgs.filter((i) => i.status === 'pending').length,
      failed: imgs.filter((i) => i.status === 'failed').length,
      bytes_on_disk: imgs.reduce((n, i) => n + (i.status === 'downloaded' ? i.bytes ?? 0 : 0), 0),
      by_kind: imgs.reduce((acc, i) => {
        acc[i.kind] = acc[i.kind] ?? { known: 0, downloaded: 0, failed: 0 };
        acc[i.kind].known++;
        if (i.status === 'downloaded') acc[i.kind].downloaded++;
        if (i.status === 'failed') acc[i.kind].failed++;
        return acc;
      }, {}),
    },
    failures: { total: Object.keys(failures.entries).length, by_phase: failureCounts },
    per_category: categories,
  };
}

function printReport() {
  const c = computeCoverage();
  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  console.log('\n================ COVERAGE ================');
  console.log(`store            : ${db.meta.store_slug} (${db.organization?.organization_name ?? 'org not fetched'})`);
  console.log(`categories       : ${c.categories.discovered} discovered, ${c.categories.listing_complete} fully listed, tree walk ${c.categories.tree_walk_complete ? 'complete' : 'INCOMPLETE'}`);
  console.log(`products         : ${c.products.collected} collected / ${c.products.expected_total_from_api ?? '?'} reported by API`);
  console.log(`product detail   : ${c.products.with_detail} fetched, ${c.products.missing_detail} missing`);
  console.log(`images           : ${c.images.downloaded}/${c.images.known} downloaded (${mb(c.images.bytes_on_disk)}), ${c.images.pending} pending, ${c.images.failed} failed`);
  console.log(`failures logged  : ${c.failures.total} ${JSON.stringify(c.failures.by_phase)}`);

  const incomplete = c.per_category.filter((x) => !x.listing_complete);
  if (incomplete.length) {
    console.log('\nCategories with incomplete listings (re-run to resume):');
    for (const x of incomplete.slice(0, 20)) {
      console.log(`  - ${x.path || x.category_name} (id ${x.category_id}) pages=${x.pages_fetched} listed=${x.products_listed}/${x.expected_products ?? '?'}`);
    }
  }
  console.log('\nPer-category tracking:');
  for (const x of c.per_category) {
    const flag = x.listing_complete ? ' ' : '!';
    console.log(
      `  ${flag} ${(x.path || x.category_name).padEnd(46).slice(0, 46)} ` +
        `listed ${String(x.products_listed).padStart(4)}/${String(x.expected_products ?? '?').padStart(4)}  ` +
        `detail ${String(x.products_with_detail).padStart(4)}`,
    );
  }
  console.log(`\ndb        : ${DB_PATH}`);
  console.log(`failures  : ${FAIL_PATH}`);
  console.log(`images    : ${IMG_DIR}`);
  console.log('==========================================\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let interrupted = false;
async function shutdown(signal) {
  if (interrupted) process.exit(130);
  interrupted = true;
  warn(`${signal} received — flushing state so the next run can resume...`);
  try {
    await flush(true);
    printReport();
  } catch (err) {
    error(`Flush on shutdown failed: ${err.message}`);
  }
  process.exit(130);
}

async function main() {
  await fsp.mkdir(OUT_DIR, { recursive: true });
  await fsp.mkdir(IMG_DIR, { recursive: true });
  logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  db = await readJson(DB_PATH, emptyDb());
  failures = await readJson(FAIL_PATH, { schema_version: SCHEMA_VERSION, entries: {} });

  // Tolerate a db.json written by an older/partial run.
  db.meta = { ...emptyDb().meta, ...db.meta };
  for (const k of ['categories', 'products', 'images']) db[k] = db[k] ?? {};
  db.cursors = { ...emptyDb().cursors, ...(db.cursors ?? {}) };
  failures.entries = failures.entries ?? {};

  if (opts.report) {
    printReport();
    return;
  }

  const startedAt = new Date().toISOString();
  db.meta.first_run_at = db.meta.first_run_at ?? startedAt;
  db.meta.last_run_at = startedAt;

  info(`Scraping store "${opts.store}" -> ${OUT_DIR}`);
  info(`phases=${opts.phases.join(',')} images=${opts.images} concurrency=${opts.concurrency} retries=${opts.retries}`);

  if (opts.retryFailed) {
    await retryFailedEntries();
  } else {
    if (opts.phases.includes('org')) await phaseOrg();
    if (opts.phases.includes('categories')) await phaseCategories();
    if (opts.phases.includes('designs')) await phaseDesigns();
    if (opts.phases.includes('details')) await phaseDetails();
    if (opts.phases.includes('images')) await phaseImages();
    // Anything that failed mid-run gets one more pass before we stop.
    if (Object.keys(failures.entries).length) {
      info('Re-attempting entries that failed during this run');
      await retryFailedEntries();
    }
  }

  db.meta.runs.push({
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    phases: opts.retryFailed ? ['retry-failed'] : opts.phases,
    images_mode: opts.images,
    products_known: Object.keys(db.products).length,
    failures_open: Object.keys(failures.entries).length,
  });
  await flush(true);
  printReport();

  const open = Object.keys(failures.entries).length;
  if (open) {
    warn(`${open} entries could not be fetched. They are logged in ${FAIL_PATH}.`);
    warn(`Re-run with:  node scripts/vastra-scrape.mjs --retry-failed`);
  } else {
    info('No outstanding failures.');
  }
}

main().catch(async (err) => {
  error(`Fatal: ${err.stack ?? err.message}`);
  try {
    await flush(true);
  } catch {}
  process.exit(1);
});
