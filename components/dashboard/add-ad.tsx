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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Názov musí mať aspoň 2 znaky.",
  }),
  description: z.string().min(10, {
    message: "Popis musí mať aspoň 10 znakov.",
  }),
});

export default function AddAd() {
  const supabase = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Na pridanie inzerátu sa musíte prihlásiť.");
      return;
    }

    const { error } = await supabase.from("ads").insert([
      {
        title: values.title,
        description: values.description,
        user_id: user.id,
      },
    ]);

    if (error) {
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
                <FormDescription>
                  Zadajte názov vášho inzerátu.
                </FormDescription>
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
          <Button type="submit">Pridať inzerát</Button>
        </form>
      </Form>
    </div>
  );
}
