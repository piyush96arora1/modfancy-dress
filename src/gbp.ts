import fs from "node:fs";
import path from "node:path";
import { OAuth2Client } from "google-auth-library";
import { CREDENTIALS_PATH, TOKEN_PATH } from "./config.js";
import type { Location, PostInput, Review } from "./types.js";

// Official Google Business Profile APIs. Free, but Google must approve the
// Cloud project first (quota is 0 QPM until then). Posts, reviews and media
// still live on the v4 "My Business" API; accounts/locations on the v1 APIs.
const ACCOUNTS = "https://mybusinessaccountmanagement.googleapis.com/v1";
const INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const V4 = "https://mybusiness.googleapis.com/v4";
const UPLOAD = "https://mybusiness.googleapis.com/upload/v1/media";

export const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

export function loadOAuthClient(): OAuth2Client {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Missing ${CREDENTIALS_PATH}. Download the OAuth "Desktop app" client JSON from Google Cloud Console and save it there.`);
  }
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const c = raw.installed ?? raw.web;
  return new OAuth2Client(c.client_id, c.client_secret, "http://127.0.0.1");
}

export class GbpClient {
  private client: OAuth2Client;

  constructor() {
    this.client = loadOAuthClient();
    if (!fs.existsSync(TOKEN_PATH)) throw new Error(`Missing ${TOKEN_PATH}. Run \`npm run auth\` first.`);
    this.client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
    this.client.on("tokens", (t) => {
      const merged = { ...JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")), ...t };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2), { mode: 0o600 });
    });
  }

  private async call<T = any>(url: string, init: { method?: string; body?: unknown; raw?: Buffer; contentType?: string } = {}): Promise<T> {
    const { token } = await this.client.getAccessToken();
    const res = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.raw ? { "Content-Type": init.contentType ?? "application/octet-stream" } : {}),
      },
      body: init.raw ? new Uint8Array(init.raw) : (init.body !== undefined ? JSON.stringify(init.body) : undefined),
    });
    const text = await res.text();
    if (!res.ok) {
      const hint = res.status === 429 || /quota/i.test(text)
        ? " (quota is 0 until Google approves your GBP API access request)"
        : "";
      throw new Error(`${init.method ?? "GET"} ${url} -> ${res.status}${hint}: ${text.slice(0, 800)}`);
    }
    return (text ? JSON.parse(text) : {}) as T;
  }

  async listLocations(): Promise<Location[]> {
    const { accounts = [] } = await this.call(`${ACCOUNTS}/accounts`);
    const out: Location[] = [];
    for (const acct of accounts) {
      let pageToken = "";
      do {
        const q = new URLSearchParams({ readMask: "name,title,storefrontAddress,websiteUri", pageSize: "100" });
        if (pageToken) q.set("pageToken", pageToken);
        const data = await this.call(`${INFO}/${acct.name}/locations?${q}`);
        for (const l of data.locations ?? []) {
          const a = l.storefrontAddress;
          out.push({
            id: `${acct.name}/${l.name}`, // v4 endpoints need accounts/{a}/locations/{l}
            title: l.title,
            address: a ? [...(a.addressLines ?? []), a.locality, a.postalCode].filter(Boolean).join(", ") : undefined,
            website: l.websiteUri,
          });
        }
        pageToken = data.nextPageToken ?? "";
      } while (pageToken);
    }
    return out;
  }

  /** Accepts a full location id or a (partial, case-insensitive) business title. */
  private async resolve(location: string): Promise<string> {
    if (/^accounts\/[^/]+\/locations\/[^/]+$/.test(location)) return location;
    const all = await this.listLocations();
    if (!location && all.length === 1) return all[0].id;
    const hit = all.find((l) => l.title.toLowerCase().includes(location.toLowerCase()));
    if (!hit) throw new Error(`No location matching "${location}". Known: ${all.map((l) => l.title).join(", ")}`);
    return hit.id;
  }

  async listReviews(location: string, opts: { unrepliedOnly?: boolean; limit?: number }): Promise<Review[]> {
    const loc = await this.resolve(location);
    const limit = opts.limit ?? 50;
    const out: Review[] = [];
    let pageToken = "";
    do {
      const q = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
      if (pageToken) q.set("pageToken", pageToken);
      const data = await this.call(`${V4}/${loc}/reviews?${q}`);
      for (const r of data.reviews ?? []) {
        if (opts.unrepliedOnly && r.reviewReply) continue;
        out.push({
          id: r.name,
          reviewer: r.reviewer?.displayName ?? "Anonymous",
          rating: STARS[r.starRating],
          comment: r.comment,
          createTime: r.createTime,
          reply: r.reviewReply?.comment,
        });
      }
      pageToken = data.nextPageToken ?? "";
    } while (pageToken && out.length < limit);
    return out.slice(0, limit);
  }

  async replyToReview(reviewId: string, comment: string): Promise<string> {
    await this.call(`${V4}/${reviewId}/reply`, { method: "PUT", body: { comment } });
    return `Replied to ${reviewId}`;
  }

  /** Uploads bytes (local file) or registers a public URL as a location photo. Returns the Google-hosted URL. */
  private async addMedia(loc: string, photo: string, category: string): Promise<string> {
    const base = { mediaFormat: "PHOTO", locationAssociation: { category } };
    if (/^https?:\/\//.test(photo)) {
      const item = await this.call(`${V4}/${loc}/media`, { method: "POST", body: { ...base, sourceUrl: photo } });
      return item.googleUrl ?? photo;
    }
    const bytes = fs.readFileSync(path.resolve(photo));
    const ref = await this.call(`${V4}/${loc}/media:startUpload`, { method: "POST", body: {} });
    await this.call(`${UPLOAD}/${ref.resourceName}?upload_type=media`, { method: "POST", raw: bytes });
    const item = await this.call(`${V4}/${loc}/media`, { method: "POST", body: { ...base, dataRef: ref } });
    return item.googleUrl;
  }

  async uploadPhoto(location: string, photo: string, category = "ADDITIONAL"): Promise<string> {
    const loc = await this.resolve(location);
    const url = await this.addMedia(loc, photo, category);
    return `Uploaded photo: ${url}`;
  }

  async createPost(location: string, post: PostInput): Promise<string> {
    const loc = await this.resolve(location);
    // Local posts only accept public sourceUrls, so local files are first
    // uploaded to the profile's photos and their googleUrl reused.
    const media = [];
    for (const p of post.photos ?? []) {
      const sourceUrl = /^https?:\/\//.test(p) ? p : await this.addMedia(loc, p, "ADDITIONAL");
      media.push({ mediaFormat: "PHOTO", sourceUrl });
    }
    const body: Record<string, unknown> = { languageCode: "en", summary: post.summary, topicType: "STANDARD" };
    if (media.length) body.media = media;
    if (post.callToAction) body.callToAction = post.callToAction;
    const created = await this.call(`${V4}/${loc}/localPosts`, { method: "POST", body });
    return `Post created (${created.state ?? "submitted"}): ${created.searchUrl ?? created.name}`;
  }
}
