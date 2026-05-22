export const paymentTiers = {
  top: {
    name: "JobWest Top zvýraznenie",
    amount: 990,
    label: "TOP 9,90 EUR",
    description: "Vyššia pozícia v zozname ponúk.",
  },
  exclusive: {
    name: "JobWest Exclusive zvýraznenie",
    amount: 1990,
    label: "Exclusive 19,90 EUR",
    description: "Najvyššia viditeľnosť a výraznejšie označenie.",
  },
  "add-ad": {
    name: "JobWest pridanie inzerátu",
    amount: 199,
    label: "Pridanie neskôr 1,99 EUR",
    description: "Budúci poplatok za pridanie nového inzerátu. Teraz je pridanie zdarma.",
  },
} as const

export type PaymentTier = keyof typeof paymentTiers

const placeholderStripeValues = new Set([
  "sk_test_your_key",
  "sk_test_your_key_here",
  "sk_live_your_key",
  "sk_live_your_key_here",
  "whsec_your_webhook_secret",
  "whsec_your_webhook_secret_here",
])

export function isConfiguredSecret(value: string | undefined): value is string {
  const trimmedValue = value?.trim()

  return !!trimmedValue && !placeholderStripeValues.has(trimmedValue)
}

export function isLiveStripeSecretForSite(value: string | undefined, siteUrl: string): value is string {
  if (!isConfiguredSecret(value)) return false

  try {
    const { hostname } = new URL(siteUrl)

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true
    }
  } catch {
    return false
  }

  return value.trim().startsWith("sk_live_")
}
