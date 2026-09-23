#!/usr/bin/env bash
# Pull a 28-day Search Console snapshot (web + image) into seodata/gsc/<date>/.
# Needs the composio CLI logged in with the google_search_console toolkit linked.
# Large results come back as {"storedInFile": true, "outputFilePath": ...}; this
# script resolves those so every saved file holds the real rows.
set -euo pipefail
END=$(date -d '3 days ago' +%F)          # GSC data lags ~2-3 days
START=$(date -d "$END -27 days" +%F)
OUT="$(cd "$(dirname "$0")" && pwd)/$(date +%F)"; mkdir -p "$OUT"
q() {
  composio execute GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY -d "{\"site_url\":\"sc-domain:modfancydress.com\",\"start_date\":\"$START\",\"end_date\":\"$END\",\"dimensions\":$1,\"row_limit\":5000,\"search_type\":\"$2\"}" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); d=json.load(open(d["outputFilePath"])) if d.get("storedInFile") else d; json.dump((d.get("data") or d).get("rows",[]), open(sys.argv[1],"w"))' "$OUT/$3.json"
}
q '[]' web total_web; q '[]' image total_image
q '["query"]' web queries_web; q '["page"]' web pages_web
q '["query"]' image queries_image; q '["page"]' image pages_image
q '["date"]' web daily_web
echo "saved $OUT ($START..$END)"
