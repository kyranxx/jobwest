import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const layout = readFileSync("app/layout.tsx", "utf8")
const headerActions = readFileSync("components/auth/header-actions.tsx", "utf8")

assert.match(layout, /import \{ AuthProvider \} from "@\/hooks\/use-auth"/)
assert.match(layout, /<AuthProvider>[\s\S]*<HeaderActions \/>[\s\S]*<\/AuthProvider>/)

assert.match(headerActions, /useAuth\(\)/)
assert.match(headerActions, /<Avatar[\s\S]*<AvatarFallback/)
assert.match(headerActions, /user\.user_metadata/)
assert.match(headerActions, /toast\.(info|success|error|loading)/)
