export const jobCategories = [
  "Sklady a logistika",
  "Výroba",
  "Remeslá a stavebníctvo",
  "Gastro a hotely",
  "Opatrovanie",
  "Doprava",
  "Poľnohospodárstvo",
  "IT a kancelária",
] as const

export const jobTypes = [
  { id: "zivnost", label: "Živnosť" },
  { id: "na-zmluvu", label: "Na zmluvu" },
  { id: "brigada", label: "Brigáda" },
] as const

export const salaryCurrencies = [
  { id: "any", label: "Všetky meny" },
  { id: "EUR", label: "EUR" },
  { id: "CHF", label: "CHF" },
  { id: "GBP", label: "GBP" },
] as const

export const languageOptions = [
  { id: "nemcina", label: "Nemčina" },
  { id: "anglictina", label: "Angličtina" },
  { id: "slovencina", label: "Slovenčina" },
  { id: "holandcina", label: "Holandčina" },
  { id: "francuzstina", label: "Francúzština" },
  { id: "taliancina", label: "Taliančina" },
] as const

export const highlightOptions = [
  { id: "exclusive", label: "Exclusive" },
  { id: "top", label: "TOP" },
] as const

export const europeanCountryCodes = new Set([
  "gb",
  "fr",
  "ch",
  "de",
  "at",
  "ie",
  "se",
  "nl",
  "es",
  "pt",
  "dk",
  "it",
  "pl",
])
