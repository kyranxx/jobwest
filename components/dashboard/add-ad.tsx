"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { countries } from "@/lib/countries";
import { toast } from "sonner";
import { jobCategories, jobTypes } from "@/lib/job-options";
import { siteConfig } from "@/lib/site";
import { emptyJobAdFormValues, jobAdFormSchema, type JobAdFormValues } from "@/lib/job-ad-form";

export default function AddAd() {
  const supabase = getSupabaseBrowserClient();
  const form = useForm<JobAdFormValues>({
    resolver: zodResolver(jobAdFormSchema),
    defaultValues: emptyJobAdFormValues,
  });

  async function onSubmit(values: JobAdFormValues) {
    if (form.formState.isSubmitting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Na pridanie inzerátu sa musíte prihlásiť.");
    } else {
      const { error } = await supabase.from("jobs").insert([{
        user_id: user.id, company: values.company, contact_info: values.contact_info, title: values.title, description: values.description,
        category: values.category, salary: values.salary, country_code: values.country_code,
        location: values.location,
        portal_code: siteConfig.portalCode,
        portal_domain: siteConfig.portalDomain,
        accommodation_provided: values.accommodation_included,
        accommodation_paid: values.accommodation_paid,
        is_top: false, highlight_tier: "standard", job_type: values.job_type,
      }]);

      if (error) { console.error("Error inserting job:", error); toast.error("Chyba pri pridávaní inzerátu."); }
      else { toast.success("Inzerát úspešne pridaný."); form.reset(); }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1 text-slate-950">Pridať inzerát</h1>
      <p className="mb-6 text-sm text-slate-600">Stačí vyplniť jasné údaje. Kontakt sa zobrazí v detaile ponuky.</p>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 mb-5 text-sm text-emerald-900 flex items-start gap-2.5">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div>
          <p><span className="font-medium">Pridanie inzerátu</span> je zdarma.</p>
          <p className="text-xs mt-0.5 text-emerald-800/80">Zvýraznenie môžete zapnúť neskôr v platbách.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="company" className="text-sm font-semibold">Firma alebo agentúra</FormLabel>
                  <FormControl>
                    <Input placeholder="Napr. JobWest Partner s.r.o." {...field} id="company" name="company" className="rounded-md" />
                  </FormControl>
                  <FormDescription>Názov zadávateľa, ktorý sa zobrazí pri ponuke.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact_info" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact_info" className="text-sm font-semibold">Kontakt pre uchádzačov</FormLabel>
                  <FormControl>
                    <Input placeholder="Napr. praca@firma.sk alebo +421 900 000 000" {...field} id="contact_info" name="contact_info" className="rounded-md" />
                  </FormControl>
                  <FormDescription>E-mail, telefón alebo jasný spôsob reakcie na ponuku.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="location" className="text-sm font-semibold">Lokalita</FormLabel>
                  <FormControl>
                    <Input placeholder="Napr. Eindhoven, Tirol, Stuttgart" {...field} id="location" name="location" className="rounded-md" />
                  </FormControl>
                  <FormDescription>Mesto, región alebo najbližšia lokalita výkonu práce.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="title" className="text-sm font-semibold">Názov pozície</FormLabel>
                <FormControl>
                  <Input placeholder="Napr. Skladník v Holandsku" {...field} id="title" name="title" className="rounded-md" />
                </FormControl>
                <FormDescription>Napríklad: Zvárač MIG/MAG alebo CNC operátor.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description" className="text-sm font-semibold">Popis ponuky</FormLabel>
                <FormControl>
                  <Textarea placeholder="Popíšte prácu, požiadavky, mzdu netto/brutto, turnusy, ubytovanie a nástup" className="resize-none min-h-[140px] rounded-md" {...field} id="description" name="description" />
                </FormControl>
                <FormDescription>Praktické podmienky uveďte stručne a konkrétne.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="category" className="text-sm font-semibold">Kategória</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="category">
                    <FormControl><SelectTrigger id="category" className="rounded-md"><SelectValue placeholder="Vyberte kategóriu" /></SelectTrigger></FormControl>
                    <SelectContent>{jobCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="country_code" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="country_code" className="text-sm font-semibold">Krajina</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="country_code">
                    <FormControl><SelectTrigger id="country_code" className="rounded-md"><SelectValue placeholder="Vyberte krajinu" /></SelectTrigger></FormControl>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="salary" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="salary" className="text-sm font-semibold">Mzda</FormLabel>
                  <FormControl><Input type="text" placeholder="Napr. 1 500" {...field} id="salary" name="salary" className="rounded-md" /></FormControl>
                  <FormDescription>Uveďte menu aj obdobie, napr. 2 200 EUR/mesiac.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="job_type" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="job_type" className="text-sm font-semibold">Druh práce</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="job_type">
                    <FormControl><SelectTrigger id="job_type" className="rounded-md"><SelectValue placeholder="Vyberte druh práce" /></SelectTrigger></FormControl>
                    <SelectContent>{jobTypes.map((jt) => <SelectItem key={jt.id} value={jt.id}>{jt.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold">Ubytovanie</h3>
            <FormField control={form.control} name="accommodation_included" render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border bg-muted/30 p-3.5">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="accommodation_included" name="accommodation_included" className="mt-0.5" /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="accommodation_included" className="text-sm">Ubytovanie zahrnuté</FormLabel>
                  <FormDescription>Je v ponuke zahrnuté ubytovanie?</FormDescription>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="accommodation_paid" render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-x-3 gap-y-0 rounded-md border bg-muted/30 p-3.5">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="accommodation_paid" name="accommodation_paid" className="mt-0.5" /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="accommodation_paid" className="text-sm">Ubytovanie hradené</FormLabel>
                  <FormDescription>Je ubytovanie plne hradené zamestnávateľom?</FormDescription>
                </div>
              </FormItem>
            )} />
          </div>

          <Button type="submit" size="lg">Pridať inzerát</Button>
        </form>
      </Form>
    </div>
  );
}
