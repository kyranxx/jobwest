import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

const [script, ...scriptArgs] = process.argv.slice(2)

if (!script) {
  console.error("Missing script path for Node 22 runner")
  process.exit(1)
}

const nodeMajor = Number(process.versions.node.split(".")[0])

if (nodeMajor === 22) {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], {
    stdio: "inherit",
    env: process.env,
  })

  process.exit(result.status ?? 1)
}

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx"
const cachedNode22 = findCachedNode22()
const command = cachedNode22 ?? npxCommand
const args = cachedNode22
  ? [script, ...scriptArgs]
  : ["-y", "-p", "node@22", "node", script, ...scriptArgs]
const childEnv = cachedNode22
  ? withPathPrepended(process.env, path.dirname(cachedNode22))
  : process.env

const result = spawnSync(command, args, {
  stdio: "inherit",
  env: { ...childEnv, JOBWEST_NODE_REEXEC: "node22" },
  shell: !cachedNode22 && process.platform === "win32",
})

if (result.error) {
  console.error(result.error.message)
}

process.exit(result.status ?? 1)

function findCachedNode22() {
  const cacheRoot = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "npm-cache", "_npx")
    : null

  if (!cacheRoot || !existsSync(cacheRoot)) return null

  const nodeExecutable = process.platform === "win32" ? "node.exe" : "node"
  const candidates = readdirSync(cacheRoot)
    .map((entry) => path.join(cacheRoot, entry, "node_modules", "node", "bin", nodeExecutable))
    .filter((candidate) => existsSync(candidate))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)

  for (const candidate of candidates) {
    const version = spawnSync(candidate, ["-v"], { encoding: "utf8" }).stdout.trim()
    if (version.startsWith("v22.")) return candidate
  }

  return null
}

function withPathPrepended(env, directory) {
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") ?? "PATH"
  const currentPath = env[pathKey]

  return {
    ...env,
    [pathKey]: currentPath ? `${directory}${path.delimiter}${currentPath}` : directory,
  }
}
