# gbp-mcp

MCP server for Google Business Profile, built on the official Google APIs. It posts updates with photos, replies to reviews and uploads photos. The API is free, but Google must approve your Cloud project before calls work (quota is 0 until then).

## Tools
- `gbp_list_locations`
- `gbp_list_reviews` (`unrepliedOnly`, `limit`)
- `gbp_reply_review` (`reviewId`, `comment`)
- `gbp_create_post` (`summary`, `photos[]`, `callToAction`)
- `gbp_upload_photo` (`photo`, `category`)
- `gbp_status`

`location` is a partial business name. It defaults to `GBP_DEFAULT_BUSINESS`. Photos can be local files, which are uploaded to the profile first, or public https URLs.

## Setup
1. In Google Cloud Console, create a project and enable **My Business Account Management API**, **My Business Business Information API** and **Google My Business API**.
2. Set up the OAuth consent screen (External, Testing) and add the profile owner's Gmail as a test user.
3. Go to Credentials → Create credentials → OAuth client ID → **Desktop app**. Download the JSON to `~/.gbp-mcp/credentials.json`.
4. Request API access at https://support.google.com/business/contact/api_default using the project number.
5. Build and authorise:
   ```bash
   npm install && npm run build
   npm run auth        # sign in as the profile owner → writes ~/.gbp-mcp/token.json
   claude mcp add gbp --scope user -e GBP_DEFAULT_BUSINESS="Mod Fancy Dresses" -- node $PWD/dist/src/index.js
   ```
6. Check approval under APIs & Services → My Business Account Management API → Quotas. **0 QPM** means pending; **300 QPM** means approved. Until then, tools return a 429/quota error.

## Use from any project
In Claude Code: *"List unreplied reviews for Mod Fancy Dresses and draft replies"*, or *"Post an update about our Diwali costumes with ~/Pictures/diwali.jpg"*.
