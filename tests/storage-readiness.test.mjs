import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const verifier = readFileSync("scripts/verify-production-readiness.mjs", "utf8")
const settings = readFileSync("components/dashboard/settings.tsx", "utf8")

assert.match(settings, /\.from\("avatars"\)/)
assert.match(verifier, /Supabase avatars storage bucket exists/)
assert.match(verifier, /\.storage\.getBucket\("avatars"\)/)

