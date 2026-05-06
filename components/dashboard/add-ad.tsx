"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { countries } from "@/lib/countries";
import { toast } from "sonner";
import { jobCategories, jobTypes } from "@/lib/job-options";

const formSchema = z.object({
  title: z.string().trim().min(5, { message: "Názov musí mať aspoň 5 znakov." }),
  description: z.string().trim().min(10, { message: "Popis musí mať aspoň 10 znakov." }),
  category: z.string({ required_error: "Prosím vyberte kategóriu." }),
  country_code: z.string({ required_error: "Prosím vyberte krajinu." }),
  salary: z.string().min(1, { message: "Plat je povinný." }),
  job_type: z.string({ required_error: "Prosím vyberte druh práce." }),
  accommodation_included: z.boolean().default(false),
  accommodation_paid: z.boolean().default(false),
});

export default function AddAd() {
  const supabase = getSupabaseBrowserClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", category: undefined, country_code: undefined,
      salary: "", job_type: undefined, accommodation_included: false, accommodation_paid: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Na pridanie inzerátu sa musíte prihlásiť."); return; }

    const { error } = await supabase.from("jobs").insert([{
      user_id: user.id, title: values.title, description: values.description,
      category: values.category, salary: values.salary, country_code: values.country_code,
      accommodation_provided: values.accommodation_included,
      accommodation_paid: values.accommodation_paid,
      is_top: false, highlight_tier: "standard", job_type: values.job_type,
    }]);

    if (error) { console.error("Error inserting job:", error); toast.error("Chyba pri pridávaní inzerátu."); }
    else { toast.success("Inzerát úspešne pridaný."); form.reset(); }
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight mb-1">Pridať nový inzerát</h1>
      <p className="mb-6 text-sm text-muted-foreground">Vyplňte údaje o pracovnej ponuke.</p>

      <div className="rounded-lg border bg-muted/30 p-3 mb-5 text-sm text-muted-foreground flex items-start gap-2.5">
        <span className="mt-0.5">ℹ️</span>
        <div>
          <p><span className="font-medium text-foreground">Pridanie inzerátu</span> je <span className="text-emerald-600 font-medium">zadarmo</span>.</p>
          <p className="text-xs mt-0.5">TOP a Exclusive zvýraznenia sú platené — nastavíte v sekcii Moje platby.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-lg border bg-card p-5 space-y-5">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="title" className="text-sm font-semibold">Názov pozície</FormLabel>
                <FormControl>
                  <Input placeholder="Napr. Java Developer" {...field} id="title" name="title" className="rounded-md" />
                </FormControl>
                <FormDescription>Zadajte názov pracovnej pozície.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description" className="text-sm font-semibold">Popis ponuky</FormLabel>
                <FormControl>
                  <Textarea placeholder="Podrobne popíšte pracovnú ponuku, požiadavky a benefity..." className="resize-none min-h-[120px] rounded-md" {...field} id="description" name="description" />
                </FormControl>
                <FormDescription>Zadajte podrobný popis pracovnej ponuky.</FormDescription>
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
                  <FormLabel htmlFor="salary" className="text-sm font-semibold">Plat (€/mesiac)</FormLabel>
                  <FormControl><Input type="text" placeholder="Napr. 1 500" {...field} id="salary" name="salary" className="rounded-md" /></FormControl>
                  <FormDescription>Aký je ponúkaný mesačný plat?</FormDescription>
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

          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Ubytovanie</h3>
            <FormField control={form.control} name="accommodation_included" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-muted/30 p-3.5">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="accommodation_included" name="accommodation_included" className="mt-0.5" /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="accommodation_included" className="text-sm">Ubytovanie zahrnuté</FormLabel>
                  <FormDescription>Je v ponuke zahrnuté ubytovanie?</FormDescription>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="accommodation_paid" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-muted/30 p-3.5">
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
