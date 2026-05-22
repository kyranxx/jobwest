import { formatJobType, formatSalaryBasis, formatSalaryUnit, getJobLanguages, parseSalary } from "@/lib/jobs"
import { languageOptions } from "@/lib/job-options"
import type { Job } from "@/lib/types"

export type JobDetailSection = {
  title: string
  items: string[]
}

const categoryCopy: Record<string, { work: string; fit: string }> = {
  Design: {
    work: "práca s vizuálnym výstupom, prototypmi a spätnou väzbou od tímu alebo klienta",
    fit: "vhodné pre človeka so zmyslom pre detail, poriadok vo výstupoch a jasnú komunikáciu",
  },
  Engineering: {
    work: "technická alebo remeselná práca s dôrazom na presnosť, bezpečnosť a kvalitu prevedenia",
    fit: "vhodné pre skúseného pracovníka, ktorý vie pracovať samostatne a drží dohodnutý postup",
  },
  Finance: {
    work: "práca s číslami, podkladmi, reportmi a pravidelnou kontrolou správnosti údajov",
    fit: "vhodné pre spoľahlivého človeka s presnosťou, diskrétnosťou a dobrým pracovným rytmom",
  },
  IT: {
    work: "produktová alebo vývojová práca s jasným zadaním, tímovou komunikáciou a doručovaním výstupov",
    fit: "vhodné pre samostatného kandidáta, ktorý rozumie zadaniu a vie komunikovať priebeh práce",
  },
  Marketing: {
    work: "práca so službou, zákazníkom alebo prevádzkou, kde je dôležitá komunikácia a spoľahlivosť",
    fit: "vhodné pre človeka s praktickým prístupom, pravidelnosťou a ochotou pracovať podľa dohody",
  },
}

export function formatSalaryDetailText(job: Job) {
  const salary = parseSalary(job.salary, job.salaryBasis)

  if (!salary) return "typ mzdy nie je upresnený"
  return `${formatSalaryUnit(salary.unitText)}, ${formatSalaryBasis(salary.basis)}`
}

export function getJobDetailSections(job: Job): JobDetailSection[] {
  const countryName = job.country?.name ?? job.country_code.toUpperCase()
  const location = [job.location, countryName].filter(Boolean).join(", ")
  const jobType = formatJobType(job.jobType).toLowerCase()
  const category = categoryCopy[job.category] ?? categoryCopy.Marketing
  const languages = getLanguageLabels(job)
  const accommodation = job.accommodation_paid
    ? "ubytovanie je hradené zamestnávateľom"
    : job.accommodation_provided
      ? "ubytovanie je zabezpečené"
      : "ubytovanie nie je v ponuke označené ako zabezpečené"

  return [
    {
      title: "Náplň práce",
      items: [
        `Pozícia ${job.title} pre ${job.company} v lokalite ${location}.`,
        category.work,
        `Spolupráca formou ${jobType}; konkrétny rozsah si kandidát potvrdí priamo cez kontakt v detaile.`,
      ],
    },
    {
      title: "Podmienky",
      items: [
        `Mzda ${job.salary} (${formatSalaryDetailText(job)}).`,
        `Miesto výkonu práce: ${location}.`,
        `K práci: ${accommodation}.`,
        languages.length > 0
          ? `Jazyk: ${languages.join(", ")}.`
          : "Jazykové požiadavky si kandidát overí pred reakciou na ponuku.",
      ],
    },
    {
      title: "Pre koho",
      items: [
        category.fit,
        "pre uchádzača, ktorý chce pred reakciou vidieť mzdu, krajinu, typ spolupráce a bývanie",
        "pre kandidáta, ktorý preferuje stručný inzerát bez skrytých poplatkov pre uchádzačov",
      ],
    },
  ]
}

export function getJobPostingDescriptionHtml(job: Job) {
  const sections = getJobDetailSections(job)
  const content = [`<p>${escapeHtml(job.description)}</p>`]

  for (const section of sections) {
    content.push(`<p>${escapeHtml(section.title)}</p>`)
    content.push(`<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`)
  }

  return content.join("")
}

function getLanguageLabels(job: Job) {
  const labels = new Map<string, string>(languageOptions.map((language) => [language.id, language.label]))

  return getJobLanguages(job)
    .map((language) => labels.get(language) ?? language)
    .filter(Boolean)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
