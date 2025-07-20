"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const passwordSchema = z.object({
  password: z.string().min(6, {
    message: "Heslo musí mať aspoň 6 znakov.",
  }),
});

const avatarSchema = z.object({
  avatar: z.instanceof(File).refine((file) => file.size < 2 * 1024 * 1024, {
    message: "Súbor musí byť menší ako 2MB.",
  }),
});

export default function Settings() {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const avatarForm = useForm<z.infer<typeof avatarSchema>>({
    resolver: zodResolver(avatarSchema),
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error("Chyba pri zmene hesla.");
    } else {
      toast.success("Heslo úspešne zmenené.");
      passwordForm.reset();
    }
  }

  async function onAvatarSubmit(values: z.infer<typeof avatarSchema>) {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Musíte byť prihlásený.");
      setUploading(false);
      return;
    }

    const file = values.avatar;
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Chyba pri nahrávaní avatara.");
    } else {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateUserError) {
        toast.error("Chyba pri aktualizácii profilu.");
      } else {
        toast.success("Avatar úspešne zmenený.");
        avatarForm.reset();
      }
    }
    setUploading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Nastavenia</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Zmena hesla</h2>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8 mt-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nové heslo</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nové heslo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Zmeniť heslo</Button>
            </form>
          </Form>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Zmena avatara</h2>
          <Form {...avatarForm}>
            <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-8 mt-4">
              <FormField
                control={avatarForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nový avatar</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={uploading}>
                {uploading ? "Nahrávam..." : "Zmeniť avatara"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
