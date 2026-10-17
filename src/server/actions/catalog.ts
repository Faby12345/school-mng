"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type CatalogActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const subjectSchema = z.object({
  name: z.string().trim().min(2, "Numele materiei este prea scurt.").max(80),
  colorToken: z.enum(["blue", "violet", "green", "orange", "rose", "cyan"]),
});

const gradeSchema = z.object({
  gradeId: z.union([z.literal(""), z.string().uuid()]).optional(),
  subjectId: z.string().uuid("Materia selectată nu este validă."),
  value: z.coerce.number().int().min(1, "Nota minimă este 1.").max(10, "Nota maximă este 10."),
  semester: z.coerce.number().int().min(1).max(2),
  assessmentType: z.string().trim().min(2, "Alege tipul evaluării.").max(50),
  gradedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data nu este validă."),
  note: z.string().trim().max(500, "Observația poate avea maximum 500 de caractere."),
});

const subjectIdSchema = z.string().uuid("Materia selectată nu este validă.");

const defaultSubjects = [
  { name: "Limba și literatura română", icon: "Languages", color_token: "rose" },
  { name: "Matematică", icon: "Sigma", color_token: "blue" },
  { name: "Limba engleză", icon: "MessageCircle", color_token: "violet" },
  { name: "Istorie", icon: "Landmark", color_token: "orange" },
  { name: "Geografie", icon: "Globe2", color_token: "cyan" },
  { name: "Biologie", icon: "Dna", color_token: "green" },
  { name: "Fizică", icon: "Atom", color_token: "blue" },
  { name: "Chimie", icon: "FlaskConical", color_token: "violet" },
  { name: "Informatică", icon: "Code2", color_token: "cyan" },
  { name: "Educație socială", icon: "UsersRound", color_token: "orange" },
] as const;

async function authenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function createSubject(formData: FormData): Promise<CatalogActionResult> {
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    colorToken: formData.get("colorToken"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Verifică materia." };
  }

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { count } = await supabase
    .from("subjects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("subjects").insert({
    user_id: user.id,
    name: parsed.data.name,
    icon: "BookOpen",
    color_token: parsed.data.colorToken,
    sort_order: count ?? 0,
  });

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "Materia există deja în catalog." : "Materia nu a putut fi salvată.",
    };
  }

  revalidatePath("/catalog");
  return { ok: true, message: "Materia a fost adăugată." };
}

export async function addDefaultSubjects(): Promise<CatalogActionResult> {
  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data: existing, error: readError } = await supabase
    .from("subjects")
    .select("name")
    .eq("user_id", user.id);

  if (readError) return { ok: false, message: "Materiile nu au putut fi verificate." };

  const existingNames = new Set((existing ?? []).map(({ name }) => name.trim().toLocaleLowerCase("ro")));
  const missing = defaultSubjects
    .filter((subject) => !existingNames.has(subject.name.toLocaleLowerCase("ro")))
    .map((subject, index) => ({
      ...subject,
      user_id: user.id,
      sort_order: (existing?.length ?? 0) + index,
    }));

  if (missing.length === 0) return { ok: true, message: "Toate materiile recomandate sunt deja adăugate." };

  const { error } = await supabase.from("subjects").insert(missing);
  if (error) return { ok: false, message: "Materiile recomandate nu au putut fi adăugate." };

  revalidatePath("/catalog");
  return { ok: true, message: `${missing.length} materii au fost adăugate.` };
}

export async function deleteSubject(subjectId: string): Promise<CatalogActionResult> {
  const parsed = subjectIdSchema.safeParse(subjectId);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Materia nu este validă." };

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data, error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { ok: false, message: "Materia nu a putut fi ștearsă." };

  revalidatePath("/catalog");
  return { ok: true, message: "Materia a fost ștearsă." };
}

export async function saveGrade(formData: FormData): Promise<CatalogActionResult> {
  const parsed = gradeSchema.safeParse({
    gradeId: formData.get("gradeId") ?? "",
    subjectId: formData.get("subjectId"),
    value: formData.get("value"),
    semester: formData.get("semester"),
    assessmentType: formData.get("assessmentType"),
    gradedOn: formData.get("gradedOn"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Verifică nota introdusă." };
  }

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", parsed.data.subjectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subject) return { ok: false, message: "Materia nu există sau nu îți aparține." };

  const grade = {
    subject_id: parsed.data.subjectId,
    value: parsed.data.value,
    semester: parsed.data.semester,
    assessment_type: parsed.data.assessmentType,
    graded_on: parsed.data.gradedOn,
    note: parsed.data.note || null,
  };

  if (parsed.data.gradeId) {
    const { data, error } = await supabase
      .from("grades")
      .update(grade)
      .eq("id", parsed.data.gradeId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) return { ok: false, message: "Nota nu a putut fi actualizată." };

    revalidatePath("/catalog");
    return { ok: true, message: "Nota a fost actualizată." };
  }

  const { error } = await supabase.from("grades").insert({ ...grade, user_id: user.id });
  if (error) return { ok: false, message: "Nota nu a putut fi adăugată." };

  revalidatePath("/catalog");
  return { ok: true, message: "Nota a fost adăugată." };
}

