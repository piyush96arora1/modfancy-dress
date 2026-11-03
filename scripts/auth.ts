// One-time OAuth consent for the Business Profile API. Opens Google's consent
// screen, catches the redirect on a loopback port, and stores the refresh token.
import http from "node:http";
import fs from "node:fs";
import { exec } from "node:child_process";
import { OAuth2Client } from "google-auth-library";
import { CREDENTIALS_PATH, TOKEN_PATH } from "../src/config.js";
import { SCOPES } from "../src/gbp.js";

const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
const c = raw.installed ?? raw.web;

const server = http.createServer();
server.listen(0, "127.0.0.1", () => {
  const port = (server.address() as { port: number }).port;
  const redirect = `http://127.0.0.1:${port}`;
  const client = new OAuth2Client(c.client_id, c.client_secret, redirect);
  const url = client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });

  server.on("request", async (req, res) => {
    const code = new URL(req.url ?? "/", redirect).searchParams.get("code");
    if (!code) return void res.end("Waiting for Google...");
    const { tokens } = await client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });
    res.end("GBP MCP authorised. You can close this tab.");
    console.log(`Saved refresh token to ${TOKEN_PATH}`);
    server.close();
  });

  console.log(`Sign in as the Business Profile owner:\n${url}\n`);
  if (!process.env.GBP_NO_OPEN) exec(`xdg-open "${url}" || open "${url}"`, () => {});
});
