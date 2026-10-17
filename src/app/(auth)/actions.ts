"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Introdu o adresă de email validă.");

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Introdu parola."),
});

const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere.").max(60),
    email: emailSchema,
    password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

function authRedirect(path: "/login" | "/signup", type: "error" | "message", text: string): never {
  const params = new URLSearchParams({ [type]: text });
  redirect(`${path}?${params.toString()}`);
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    authRedirect("/login", "error", parsed.error.issues[0]?.message ?? "Verifică datele introduse.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    authRedirect("/login", "error", "Emailul sau parola nu sunt corecte.");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    authRedirect("/signup", "error", parsed.error.issues[0]?.message ?? "Verifică datele introduse.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
    },
  });

  if (error) {
    authRedirect("/signup", "error", "Contul nu a putut fi creat. Emailul poate fi deja folosit.");
  }

  if (!data.session) {
    authRedirect(
      "/signup",
      "error",
      "Confirmarea emailului este activă în Supabase. Dezactiveaz-o pentru autentificare imediată.",
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

