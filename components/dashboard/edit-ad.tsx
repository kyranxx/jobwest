"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { countries } from "@/lib/countries";
import { emptyJobAdFormValues, jobAdFormSchema, type JobAdFormValues } from "@/lib/job-ad-form";
import { jobCategories, jobTypes } from "@/lib/job-options";
import { siteConfig } from "@/lib/site";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";

type EditAdProps = {
  jobId: string;
};

export default function EditAd({ jobId }: EditAdProps) {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<JobAdFormValues>({
    resolver: zodResolver(jobAdFormSchema),
    defaultValues: emptyJobAdFormValues,
  });

  useEffect(() => {
    let cancelled = false;
    const numericJobId = Number(jobId);

    async function loadJob() {
      if (!user) return;

      if (!Number.isInteger(numericJobId) || numericJobId <= 0) {
        setLoadError("Inzerát sa nenašiel.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("company,contact_info,title,description,category,country_code,location,salary,job_type,accommodation_included,accommodation_paid")
        .eq("id", numericJobId)
        .eq("user_id", user.id)
        .eq("portal_code", siteConfig.portalCode)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setLoadError("Inzerát sa nenašiel alebo nemáte oprávnenie.");
        setIsLoading(false);
        return;
      }

      form.reset({
        company: data.company ?? "",
        contact_info: data.contact_info ?? "",
        title: data.title,
        description: data.description ?? "",
        category: data.category,
        country_code: data.country_code,
        location: data.location ?? "",
        salary: data.salary,
        job_type: data.job_type,
        accommodation_included: Boolean(data.accommodation_included),
        accommodation_paid: Boolean(data.accommodation_paid),
      });
      setIsLoading(false);
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [form, jobId, supabase, user]);

  async function onSubmit(values: JobAdFormValues) {
    if (!user) {
      toast.error("Na úpravu inzerátu sa musíte prihlásiť.");
      return;
    }

    const numericJobId = Number(jobId);

    if (!Number.isInteger(numericJobId) || numericJobId <= 0) {
      toast.error("Inzerát sa nenašiel.");
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .update({
        company: values.company,
        contact_info: values.contact_info,
        title: values.title,
        description: values.description,
        category: values.category,
        country_code: values.country_code,
        location: values.location,
        salary: values.salary,
        job_type: values.job_type,
        accommodation_provided: values.accommodation_included,
        accommodation_included: values.accommodation_included,
        accommodation_paid: values.accommodation_paid,
      })
      .eq("id", numericJobId)
      .eq("user_id", user.id)
      .eq("portal_code", siteConfig.portalCode)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      toast.error("Inzerát sa nepodarilo uložiť.");
      return;
    }

    toast.success("Inzerát bol uložený.");
  }

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">Načítavam inzerát...</div>;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">Inzerát nie je dostupný</h1>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/ucet/moje-inzeraty">
            <ArrowLeft className="size-4" />
            Späť na moje inzeráty
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button asChild variant="ghost" className="mb-4 px-0 text-slate-600 hover:bg-transparent hover:text-slate-950">
        <Link href="/ucet/moje-inzeraty">
          <ArrowLeft className="size-4" />
          Späť na moje inzeráty
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Upraviť inzerát</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Zmeny sa uložia iba pre váš inzerát na portáli {siteConfig.portalDomain}.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField control={form.control} name="company" label="Firma alebo agentúra" />
              <TextField control={form.control} name="contact_info" label="Kontakt pre uchádzačov" />
              <TextField control={form.control} name="location" label="Lokalita" />
            </div>
            <TextField control={form.control} name="title" label="Názov pozície" />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description" className="text-sm font-semibold">Popis ponuky</FormLabel>
                <FormControl>
                  <Textarea {...field} id="description" name="description" className="min-h-[140px] resize-none rounded-md" />
                </FormControl>
                <FormDescription>Uveďte podmienky konkrétne a bez všeobecných fráz.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField control={form.control} name="category" label="Kategória" items={jobCategories.map((value) => ({ value, label: value }))} />
              <SelectField control={form.control} name="country_code" label="Krajina" items={countries.map((country) => ({ value: country.code, label: country.name }))} />
              <TextField control={form.control} name="salary" label="Mzda" />
              <SelectField control={form.control} name="job_type" label="Druh práce" items={jobTypes.map((type) => ({ value: type.id, label: type.label }))} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-950">Ubytovanie</h2>
            <BooleanField control={form.control} name="accommodation_included" label="Ubytovanie zahrnuté" />
            <BooleanField control={form.control} name="accommodation_paid" label="Ubytovanie hradené" />
          </div>

          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Ukladám..." : "Uložiť zmeny"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

type FieldProps = {
  control: ReturnType<typeof useForm<JobAdFormValues>>["control"];
  name: keyof JobAdFormValues;
  label: string;
};

function TextField({ control, name, label }: FieldProps) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel htmlFor={name} className="text-sm font-semibold">{label}</FormLabel>
        <FormControl>
          <Input {...field} id={name} name={name} className="rounded-md" value={String(field.value ?? "")} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function SelectField({ control, name, label, items }: FieldProps & { items: { value: string; label: string }[] }) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel htmlFor={name} className="text-sm font-semibold">{label}</FormLabel>
        <Select onValueChange={field.onChange} value={String(field.value ?? "")} name={name}>
          <FormControl>
            <SelectTrigger id={name} className="rounded-md">
              <SelectValue placeholder={label} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function BooleanField({ control, name, label }: FieldProps) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex flex-row items-start gap-x-3 rounded-md border bg-muted/30 p-3.5">
        <FormControl>
          <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} id={name} name={name} className="mt-0.5" />
        </FormControl>
        <FormLabel htmlFor={name} className="text-sm">{label}</FormLabel>
      </FormItem>
    )} />
  );
}
