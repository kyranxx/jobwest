import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

const layout = readFileSync("app/layout.tsx", "utf8")
const sitemap = readFileSync("app/sitemap.ts", "utf8")

assert.match(layout, /href="\/ponuky"/)
assert.match(layout, /href="\/krajiny"/)
assert.equal(existsSync("app/ponuky/page.tsx"), true)
assert.equal(existsSync("app/krajiny/page.tsx"), true)
assert.match(sitemap, /"\/ponuky"/)
assert.match(sitemap, /"\/krajiny"/)
