#!/usr/bin/env bash
# Usage: scripts/check-status-codes.sh [base]  — asserts status codes for known cases.
B=${1:-http://localhost:3000}; fail=0
expect() { got=$(curl -s -o /dev/null -w '%{http_code}' "$B$2"); [ "$got" = "$1" ] && echo "ok   $1 $2" || { echo "FAIL $2 expected $1 got $got"; fail=1; }; }
expect 404 /category/does-not-exist-xyz
expect 404 /wholesale/category/does-not-exist-xyz
# Active but with zero live products on 23 Sep 2026 — swap in another empty slug if it gets stock.
expect 404 /category/frock-dress
expect 404 /wholesale/category/frock-dress
expect 404 /products/does-not-exist-xyz
expect 404 /blog/does-not-exist-xyz
expect 200 /category/dandiya-dress
expect 200 /wholesale/category/dandiya-dress
exit $fail
