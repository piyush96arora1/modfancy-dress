#!/usr/bin/env node
import fs from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CREDENTIALS_PATH, DEFAULT_BUSINESS, TOKEN_PATH } from "./config.js";
import { GbpClient } from "./gbp.js";

// Created lazily so the server still starts (and gbp_status still works) before setup is finished.
let client: GbpClient | undefined;

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

function wrap<A>(fn: (c: GbpClient, args: A) => Promise<unknown>) {
  return async (args: A) => {
    try {
      client ??= new GbpClient();
      return ok(await fn(client, args));
    } catch (err) {
      const msg = (err as Error).message;
      // A revoked/expired refresh token stays cached in memory; drop the client so the
      // next call re-reads token.json (e.g. after `npm run auth`) without a server restart.
      if (/invalid_grant/.test(msg)) client = undefined;
      const hint = /invalid_grant/.test(msg) ? " — sign-in expired; run `npm run auth` in the gbp-mcp folder, then retry" : "";
      return { content: [{ type: "text" as const, text: `Error: ${msg}${hint}` }], isError: true };
    }
  };
}

const locationArg = z.string().default(DEFAULT_BUSINESS)
  .describe("Business name (partial match) or location id 'accounts/x/locations/y'. Defaults to GBP_DEFAULT_BUSINESS.");

const server = new McpServer({ name: "gbp-mcp", version: "1.0.0" });

server.registerTool("gbp_list_locations", {
  description: "List Google Business Profile locations the authorised owner manages.",
  inputSchema: {},
}, wrap((c) => c.listLocations()));

server.registerTool("gbp_list_reviews", {
  description: "List customer reviews for a business, newest first. Use before replying to get review ids.",
  inputSchema: {
    location: locationArg,
    unrepliedOnly: z.boolean().default(false).describe("Only reviews without an owner reply"),
    limit: z.number().int().min(1).max(200).default(30),
  },
}, wrap((c, a) => c.listReviews(a.location, { unrepliedOnly: a.unrepliedOnly, limit: a.limit })));

server.registerTool("gbp_reply_review", {
  description: "Publish (or replace) the owner's public reply to a review. Visible to everyone on Google — confirm the text with the user first.",
  inputSchema: {
    reviewId: z.string().describe("Review id from gbp_list_reviews"),
    comment: z.string().min(1).max(4096),
  },
}, wrap((c, a) => c.replyToReview(a.reviewId, a.comment)));

server.registerTool("gbp_create_post", {
  description: "Publish an update post (text + optional photos + optional button) on the Business Profile. Public — confirm with the user first.",
  inputSchema: {
    location: locationArg,
    summary: z.string().min(1).max(1500).describe("Post text (max 1500 chars)"),
    photos: z.array(z.string()).optional().describe("Absolute local image paths or public https URLs"),
    callToAction: z.object({
      actionType: z.enum(["BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"]),
      url: z.string().url().optional().describe("Required for all types except CALL"),
    }).optional(),
  },
}, wrap((c, a) => c.createPost(a.location, { summary: a.summary, photos: a.photos, callToAction: a.callToAction })));

server.registerTool("gbp_upload_photo", {
  description: "Add a photo to the Business Profile's photo gallery.",
  inputSchema: {
    location: locationArg,
    photo: z.string().describe("Absolute local image path or public https URL"),
    category: z.enum(["ADDITIONAL", "COVER", "PROFILE", "LOGO", "EXTERIOR", "INTERIOR", "PRODUCT", "AT_WORK", "TEAMS"]).default("ADDITIONAL"),
  },
}, wrap((c, a) => c.uploadPhoto(a.location, a.photo, a.category)));

server.registerTool("gbp_status", {
  description: "Show whether setup is complete (OAuth client + token).",
  inputSchema: {},
}, async () => ok({
  credentials: fs.existsSync(CREDENTIALS_PATH) ? CREDENTIALS_PATH : `missing — save the OAuth Desktop client JSON to ${CREDENTIALS_PATH}`,
  token: fs.existsSync(TOKEN_PATH) ? TOKEN_PATH : "missing — run `npm run auth` in the gbp-mcp folder",
  defaultBusiness: DEFAULT_BUSINESS || null,
  note: "If calls fail with 429/quota errors, Google has not approved API access yet (quota 0 QPM).",
}));

await server.connect(new StdioServerTransport());
console.error("gbp-mcp running");
