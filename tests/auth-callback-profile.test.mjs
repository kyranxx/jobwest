import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const callback = readFileSync("app/auth/callback/route.ts", "utf8")

assert.match(callback, /profileError\.code === ['"]PGRST116['"]/)
const profileErrorBranch = callback.match(/else if \(profileError\) \{(?<body>[\s\S]*?)\n      \}/)?.groups?.body ?? ""

assert.match(
  profileErrorBranch,
  /return NextResponse\.redirect\(`\$\{origin\}\/auth\/auth-code-error`\)/,
)
assert.match(callback, /\.insert\(\{[\s\S]*id: data\.user\.id[\s\S]*email: data\.user\.email[\s\S]*\}\)/)
