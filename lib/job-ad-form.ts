import { z } from "zod"

export const jobAdFormSchema = z.object({
  company: z.string().trim().min(2, { message: "Názov firmy musí mať aspoň 2 znaky." }),
  contact_info: z
    .string()
    .trim()
    .min(5, { message: "Kontakt musí mať aspoň 5 znakov." })
    .regex(/(@|\+\d{3,}|http|www\.)/i, { message: "Uveďte e-mail, telefón alebo web." }),
  title: z.string().trim().min(5, { message: "Názov musí mať aspoň 5 znakov." }),
  description: z.string().trim().min(40, { message: "Popis musí mať aspoň 40 znakov." }),
  category: z.string().min(1, { message: "Prosím vyberte kategóriu." }),
  country_code: z.string().min(1, { message: "Prosím vyberte krajinu." }),
  location: z.string().trim().min(2, { message: "Lokalita musí mať aspoň 2 znaky." }),
  salary: z
    .string()
    .trim()
    .min(3, { message: "Plat je povinný." })
    .regex(/\b(EUR|CHF|GBP)\b/i, { message: "Uveďte menu EUR, CHF alebo GBP." }),
  job_type: z.string().min(1, { message: "Prosím vyberte druh práce." }),
  accommodation_included: z.boolean().default(false),
  accommodation_paid: z.boolean().default(false),
})

export type JobAdFormValues = z.infer<typeof jobAdFormSchema>

export const emptyJobAdFormValues: JobAdFormValues = {
  company: "",
  contact_info: "",
  title: "",
  description: "",
  category: "",
  country_code: "",
  location: "",
  salary: "",
  job_type: "",
  accommodation_included: false,
  accommodation_paid: false,
}
