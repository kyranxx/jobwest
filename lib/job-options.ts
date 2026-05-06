export const jobCategories = ["IT", "Marketing", "Design", "Finance", "Engineering"] as const

export const jobTypes = [
  { id: "zivnost", label: "Živnosť" },
  { id: "na-zmluvu", label: "Na zmluvu" },
  { id: "brigada", label: "Brigáda" },
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
