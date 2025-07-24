"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Heslo musí mať aspoň 8 znakov.")
    .regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno.")
    .regex(/[0-9]/, "Heslo musí obsahovať aspoň jedno číslo.")
    .regex(/[^A-Za-z0-9]/, "Heslo musí obsahovať aspoň jeden špeciálny znak."),
  avatar: z
    .any()
    .refine((files) => files?.length == 1, "Obrázok je povinný.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Maximálna veľkosť súboru je 2MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Povolené sú iba súbory .jpg, .png a .gif."
    ),
});

export default function Settings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      avatar: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast.success("Nastavenia úspešne uložené!");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nastavenia</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nové heslo</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  Zadajte svoje nové heslo. Musí obsahovať aspoň 8 znakov, jedno
                  veľké písmeno, jedno číslo a jeden špeciálny znak.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Nahrajte svoj nový avatar. Maximálna veľkosť je 2MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Uložiť zmeny</Button>
        </form>
      </Form>
    </div>
  );
}
