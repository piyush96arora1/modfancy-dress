---
name: shop-run
description: One command for the recurring Mod Fancy Dress shop work. Checks what is due (new or broken products, Instagram queue, coming festival) and dispatches the specialist agent for each job that has work, then gives the owner one plain-language report. Use when the owner types /shop-run, or says "do the daily/regular work", "check everything", "run the shop routine". Args: none (triage everything) or a job name to force it — `products`.
---

# /shop-run

The owner runs the shop's routine with one command. Your job is to **triage first, dispatch only
what has work, and report once**. Never run an agent that has nothing to do — every agent is
real cost, and an empty run should end in one line.

## Jobs

| job | agent | due when | status |
|---|---|---|---|
| `products` | `catalog-steward` | the audit reports `summary.agentWork > 0` | built |
| `weekly` | seo-auditor, vitals-checker, analytics-analyst | 7 days since last weekly report | not built yet |
| `social` | social-manager, gbp-manager | queue item ready and none posted today; or queue empty with a festival ≤ 30 days out | not built yet |
| `festival` | festival-planner | a festival in the next 21–35 days with no plan in `docs/` | not built yet |

For a job that is "not built yet", still report whether it is due in one line, so the owner sees
it, and offer to do it in this session by hand. Don't spawn an agent for it.

## Steps

### 1. Triage (cheap, no agents)

Run these in parallel from the repo root:

```bash
npx tsx scripts/audit-catalog-gaps.ts --json --days 30
git log -1 --format='%cd %s' --date=short
ls -t docs/social/*.json | head -1
```

- **products** is due when `summary.agentWork > 0`. Gaps that need the owner (`price`, `hidden`,
  counted in `summary.ownerWork`) go straight into "Needs you". No agent is needed to report them.
  `summary.backlog` is old products missing alt text. Mention the number only.
- **social**: in the newest queue, find the lowest `order` with `status: "ready"`. Due if one
  exists. Empty queue → say which festival is next (below) and that its queue needs preparing.
- **festival**: compare today with the calendar: Diwali, Halloween (31 Oct), Children's Day
  (14 Nov, Nehru demand), Christmas (25 Dec), Republic Day (26 Jan), annual-function season
  (Dec–Feb), Holi, Independence Day (15 Aug), Janmashtami, Ganesh Chaturthi, Navratri/Garba,
  Dussehra/Ramleela. Optimisation should start ~1 month before each one (see memory
  `seasonal-demand-calendar.md`). Look in `scripts/setup-*-<year>.ts` and `docs/` to see whether
  a festival already has work done.

If the owner passed a job name, skip triage for the other jobs and run that one.

### 2. Dispatch

For each due job that is built, spawn its agent with the Agent tool (`subagent_type` = the agent
name). When more than one is due, send them in a single message so they run in parallel. Give
each a short brief with what triage found, e.g.:

> Audit: agentWork 2 — manthra-fancy-dress and dandiya-lehnga (uploaded 5 Oct; empty copy and alt,
> vague names). Owner items already reported by me: navratri-chaniya-choli price. Close the
> agent work, commit once.

Agents commit their own work. One commit per agent, per run (deploys cost Googlebot response
time, see memory `crawl-response-spikes-are-deploys.md`).

### 3. Report

One message, plain language, the owner is not technical:

```
Shop run — <date>

✅ Products: <what the agent fixed, one line each>  (commit <sha>)
⚠️ Needs you: <price errors, unclear photos, uploads to make>
📅 Coming up: <festival> in <n> days — <what's due, or "plan ready">
📸 Instagram: <next queued post, or "queue empty — want me to prepare <festival> posts?">
🔁 Weekly checks (SEO / speed / analytics): not automated yet — last done <date if known>
```

Then save anything new the agents learned to memory (the main session owns memory).
