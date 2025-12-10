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
import { useAuth } from "@/hooks/use-auth";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Aktuálne heslo je povinné."),
    newPassword: z
      .string()
      .min(8, "Heslo musí mať aspoň 8 znakov.")
      .regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno.")
      .regex(/[0-9]/, "Heslo musí obsahovať aspoň jedno číslo.")
      .regex(/[^A-Za-z0-9]/, "Heslo musí obsahovať aspoň jeden špeciálny znak."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Heslá sa nezhodujú.",
    path: ["confirmPassword"],
  });

const avatarFormSchema = z.object({
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

function PasswordSettings() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    // TODO: Implement actual password change via Supabase
    toast.success("Heslo úspešne zmenené!");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Zmena hesla</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Input
            type="text"
            autoComplete="username"
            value={user?.email || ""}
            className="hidden"
            readOnly
            id="username"
            name="username"
          />
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="currentPassword">Aktuálne heslo</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    id="currentPassword"
                    name="currentPassword"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="newPassword">Nové heslo</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    id="newPassword"
                    name="newPassword"
                    autoComplete="new-password"
                  />
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">Potvrďte nové heslo</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Zmeniť heslo</Button>
        </form>
      </Form>
    </div>
  );
}

function AvatarSettings() {
  const form = useForm<z.infer<typeof avatarFormSchema>>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      avatar: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof avatarFormSchema>) {
    // TODO: Implement actual avatar upload to Supabase Storage
    toast.success("Avatar úspešne zmenený!");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 mt-8">Zmena avatara</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="avatar">Avatar</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    id="avatar"
                    name="avatar"
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
          <Button type="submit">Zmeniť avatar</Button>
        </form>
      </Form>
    </div>
  );
}

export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nastavenia</h1>
      <PasswordSettings />
      <AvatarSettings />
    </div>
  );
}
