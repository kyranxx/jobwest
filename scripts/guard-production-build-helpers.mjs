export const productionGateArgs = [
  "scripts/verify-production-readiness.mjs",
  "--mode=deploy",
  "--skip-vercel",
]

export function shouldRunProductionGate(env) {
  return env.VERCEL_ENV === "production"
}
