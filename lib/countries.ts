export const countries = [
  { code: 'gb', name: 'Spojené kráľovstvo', flag: 'gb' },
  { code: 'fr', name: 'Francúzsko', flag: 'fr' },
  { code: 'ch', name: 'Švajčiarsko', flag: 'ch' },
  { code: 'de', name: 'Nemecko', flag: 'de' },
  { code: 'at', name: 'Rakúsko', flag: 'at' },
  { code: 'ie', name: 'Írsko', flag: 'ie' },
  { code: 'se', name: 'Švédsko', flag: 'se' },
  { code: 'nl', name: 'Holandsko', flag: 'nl' },
  { code: 'es', name: 'Španielsko', flag: 'es' },
  { code: 'pt', name: 'Portugalsko', flag: 'pt' },
  { code: 'dk', name: 'Dánsko', flag: 'dk' },
  { code: 'it', name: 'Taliansko', flag: 'it' },
  { code: 'pl', name: 'Poľsko', flag: 'pl' },
  { code: 'cz', name: 'Česko', flag: 'cz' },
];

export const countryCopy: Record<string, { locative: string; searchTitle: string }> = {
  at: { locative: "Rakúsku", searchTitle: "Práca v Rakúsku" },
  ch: { locative: "Švajčiarsku", searchTitle: "Práca vo Švajčiarsku" },
  cz: { locative: "Česku", searchTitle: "Práca v Česku" },
  de: { locative: "Nemecku", searchTitle: "Práca v Nemecku" },
  dk: { locative: "Dánsku", searchTitle: "Práca v Dánsku" },
  es: { locative: "Španielsku", searchTitle: "Práca v Španielsku" },
  fr: { locative: "Francúzsku", searchTitle: "Práca vo Francúzsku" },
  gb: { locative: "Spojenom kráľovstve", searchTitle: "Práca v Spojenom kráľovstve" },
  ie: { locative: "Írsku", searchTitle: "Práca v Írsku" },
  it: { locative: "Taliansku", searchTitle: "Práca v Taliansku" },
  nl: { locative: "Holandsku", searchTitle: "Práca v Holandsku" },
  pl: { locative: "Poľsku", searchTitle: "Práca v Poľsku" },
  pt: { locative: "Portugalsku", searchTitle: "Práca v Portugalsku" },
  se: { locative: "Švédsku", searchTitle: "Práca vo Švédsku" },
}

export function getCountryPath(code: string) {
  return `/krajiny/${code.toLowerCase()}`
}

export function getCountrySearchTitle(code: string, fallbackName: string) {
  return countryCopy[code]?.searchTitle ?? `Práca - ${fallbackName}`
}

export function getCountryInPhrase(code: string, fallbackName: string) {
  const locative = countryCopy[code]?.locative ?? fallbackName
  const preposition = ["ch", "fr", "se"].includes(code) ? "vo" : "v"

  return `${preposition} ${locative}`
}
