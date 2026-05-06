export const paymentTiers = {
  top: {
    name: "JobWest Top zvýraznenie",
    amount: 199,
    label: "Top 1,99 EUR",
    description: "Top pozícia pre pracovný inzerát.",
  },
  exclusive: {
    name: "JobWest Exclusive zvýraznenie",
    amount: 499,
    label: "Exclusive 4,99 EUR",
    description: "Najvyššie zvýraznenie pracovného inzerátu.",
  },
  "add-ad": {
    name: "JobWest pridanie inzerátu",
    amount: 199,
    label: "Pridanie neskôr 1,99 EUR",
    description: "Budúci poplatok za pridanie nového inzerátu. Teraz je pridanie zdarma.",
  },
} as const

export type PaymentTier = keyof typeof paymentTiers
export type HighlightCheckoutTier = Exclude<PaymentTier, "add-ad">
