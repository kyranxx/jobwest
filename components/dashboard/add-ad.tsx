"use client";

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

const formSchema = z.object({
  title: z.string().trim().min(5, {
    message: "Názov musí mať aspoň 5 znakov.",
  }),
  description: z.string().trim().min(10, {
    message: "Popis musí mať aspoň 10 znakov.",
  }),
  category: z.string({
    required_error: "Prosím vyberte kategóriu.",
  }),
  country_code: z.string({
    required_error: "Prosím vyberte krajinu.",
  }),
  salary: z.string().min(1, {
    message: "Plat je povinný.",
  }),
  accommodation_included: z.boolean().default(false),
  accommodation_paid: z.boolean().default(false),
});

const categories = ["IT", "Marketing", "Design", "Finance", "Engineering"];

export default function AddAd() {
  const supabase = getSupabaseBrowserClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      country_code: undefined,
      salary: "",
      accommodation_included: false,
      accommodation_paid: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Na pridanie inzerátu sa musíte prihlásiť.");
      return;
    }

    const { error } = await supabase.from("jobs").insert([
      {
        user_id: user.id,
        title: values.title,
        description: values.description,
        category: values.category,
        salary: values.salary,
        country_code: values.country_code,
        accommodation_included: values.accommodation_included,
        accommodation_paid: values.accommodation_paid,
        is_top: false, // Default value
        job_type: "Full-time", // Default value
      },
    ]);

    if (error) {
      console.error("Error inserting job:", error);
      toast.error("Chyba pri pridávaní inzerátu.");
    } else {
      toast.success("Inzerát úspešne pridaný.");
      form.reset();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pridať nový inzerát</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Názov</FormLabel>
                <FormControl>
                  <Input placeholder="Názov inzerátu" {...field} />
                </FormControl>
                <FormDescription>Zadajte názov vášho inzerátu.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Popis</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Popis inzerátu"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Zadajte podrobný popis vášho inzerátu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategória</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte kategóriu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  V akej kategórii je pracovná ponuka?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Krajina</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte krajinu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  V akej krajine je pracovná ponuka?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plat (€/mesiac)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Napr. 1500" {...field} />
                </FormControl>
                <FormDescription>
                  Aký je ponúkaný mesačný plat?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accommodation_included"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Ubytovanie zahrnuté
                  </FormLabel>
                  <FormDescription>
                    Je v ponuke zahrnuté ubytovanie?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accommodation_paid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Ubytovanie hradené
                  </FormLabel>
                  <FormDescription>
                    Je ubytovanie plne hradené zamestnávateľom?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">Pridať inzerát</Button>
        </form>
      </Form>
    </div>
  );
}
