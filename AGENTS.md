# Jobwest Agent Guide

## Shared User Rules

- Keep answers short and simple.
- Use real root-cause fixes. No hacks, fake behavior, or hidden bandaids unless explicitly requested.
- Use relevant skills/plugins automatically when they clearly fit, but do not force a workflow that does not reduce risk.
- Use subagents automatically when a task has independent parallel lanes that can reduce time or risk; skip them for small or tightly coupled work.
- Verify work before saying it is done. If verification cannot run, state the blocker.
- For UI/browser bugs, prefer Chrome DevTools/CDP when convenient; use Playwright for repeatable scripted checks.
- If asked what was used, list commands, tools, skills, and plugins plainly.
- Protect unrelated user changes and local secrets.
- If project orientation is needed, read `C:\Users\User\Desktop\Projects\WORKSPACE_MAP.md`; this file and the project README win over the map.

## Project Notes

- Use Node `22.x` and `pnpm` for package scripts. The package declares `pnpm@10.28.2`.

## SEO Agent Audit

For SEO audits or SEO-related fixes, use the shared skill at:

`C:\Users\User\.codex\skills\seo-agent-audit`

Rules:

- Read this project's `seo.config.md` if present.
- Verify findings with scripts, source HTML, browser inspection, logs, or supplied Search Console data.
- Do not guess URLs or report unverified SEO issues as confirmed.
- Use the shared audit template and keep every issue `In review` until evidence proves it.
- Prefer root-cause fixes in templates/components/config over manual one-page patches.

## AI Citation Readiness

For public pages that should be found, mentioned, or cited by AI/search tools, use:

`C:\Users\User\Desktop\Projects\AI_CITATION_READINESS.md`

Project rule:

- Keep important facts in crawlable HTML near relevant headings.
- Use one strong page per search intent or claim, with clear title/H1, canonical/indexability, internal links, and relevant schema where it fits naturally.
- Prefer Search Console/query evidence and live rendered HTML checks before SEO copy changes.
- Use real third-party proof only; never fake mentions, reviews, or links.
