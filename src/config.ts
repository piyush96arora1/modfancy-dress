import os from "node:os";
import path from "node:path";
import fs from "node:fs";

// Everything user-specific lives outside the repo so the server can be
// launched from any project without leaking secrets into it.
export const HOME = process.env.GBP_MCP_HOME ?? path.join(os.homedir(), ".gbp-mcp");
export const CREDENTIALS_PATH = path.join(HOME, "credentials.json"); // OAuth Desktop client from Google Cloud
export const TOKEN_PATH = path.join(HOME, "token.json"); // refresh token written by `npm run auth`

fs.mkdirSync(HOME, { recursive: true });

/** Default business (partial title match) so callers can omit `location`. */
export const DEFAULT_BUSINESS = process.env.GBP_DEFAULT_BUSINESS ?? "";
