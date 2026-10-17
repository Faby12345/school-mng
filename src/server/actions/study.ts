"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type StudyActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const topicSchema = z.object({
  topicId: z.union([z.literal(""), z.string().uuid()]).optional(),
  subjectId: z.string().uuid("Materia nu este validă."),
  title: z.string().trim().min(2, "Titlul trebuie să aibă cel puțin 2 caractere.").max(100),
  notes: z.string().trim().max(2000, "Descrierea poate avea maximum 2.000 de caractere."),
});

const flashcardSchema = z.object({
  flashcardId: z.union([z.literal(""), z.string().uuid()]).optional(),
  topicId: z.string().uuid("Capitolul nu este valid."),
  title: z.string().trim().min(2, "Titlul trebuie să aibă cel puțin 2 caractere.").max(160),
  content: z.string().trim().min(2, "Notița trebuie să aibă cel puțin 2 caractere.").max(3000),
});

const idSchema = z.string().uuid("Elementul selectat nu este valid.");

async function authenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function refreshStudy(subjectId?: string, topicId?: string) {
  revalidatePath("/study");
  if (subjectId) revalidatePath(`/study/${subjectId}`);
  if (subjectId && topicId) revalidatePath(`/study/${subjectId}/${topicId}`);
}

export async function saveTopic(formData: FormData): Promise<StudyActionResult> {
  const parsed = topicSchema.safeParse({
    topicId: formData.get("topicId") ?? "",
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Verifică datele." };

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", parsed.data.subjectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!subject) return { ok: false, message: "Materia nu există sau nu îți aparține." };

  const topic = { title: parsed.data.title, notes: parsed.data.notes };
  if (parsed.data.topicId) {
    const { data, error } = await supabase
      .from("lessons")
      .update(topic)
      .eq("id", parsed.data.topicId)
      .eq("subject_id", parsed.data.subjectId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) return { ok: false, message: "Capitolul nu a putut fi actualizat." };
    refreshStudy(parsed.data.subjectId, parsed.data.topicId);
    return { ok: true, message: "Capitolul a fost actualizat." };
  }

  const { error } = await supabase.from("lessons").insert({
    ...topic,
    subject_id: parsed.data.subjectId,
    user_id: user.id,
  });
  if (error) return { ok: false, message: "Capitolul nu a putut fi adăugat." };

  refreshStudy(parsed.data.subjectId);
  return { ok: true, message: "Capitolul a fost adăugat." };
}

export async function deleteTopic(topicId: string, subjectId: string): Promise<StudyActionResult> {
  const parsedTopicId = idSchema.safeParse(topicId);
  const parsedSubjectId = idSchema.safeParse(subjectId);
  if (!parsedTopicId.success || !parsedSubjectId.success) return { ok: false, message: "Capitolul nu este valid." };

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data, error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", parsedTopicId.data)
    .eq("subject_id", parsedSubjectId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "Capitolul nu a putut fi șters." };

  refreshStudy(parsedSubjectId.data, parsedTopicId.data);
  return { ok: true, message: "Capitolul și notițele sale au fost șterse." };
}

export async function saveFlashcard(formData: FormData): Promise<StudyActionResult> {
  const parsed = flashcardSchema.safeParse({
    flashcardId: formData.get("flashcardId") ?? "",
    topicId: formData.get("topicId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Verifică notița." };

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data: topic } = await supabase
    .from("lessons")
    .select("id, subject_id")
    .eq("id", parsed.data.topicId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!topic) return { ok: false, message: "Capitolul nu există sau nu îți aparține." };

  const flashcard = { question: parsed.data.title, answer: parsed.data.content };
  if (parsed.data.flashcardId) {
    const { data, error } = await supabase
      .from("flashcards")
      .update(flashcard)
      .eq("id", parsed.data.flashcardId)
      .eq("lesson_id", parsed.data.topicId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) return { ok: false, message: "Notița nu a putut fi actualizată." };
    refreshStudy(topic.subject_id, parsed.data.topicId);
    return { ok: true, message: "Notița a fost actualizată." };
  }

  const { error } = await supabase.from("flashcards").insert({
    ...flashcard,
    lesson_id: parsed.data.topicId,
    user_id: user.id,
    source: "manual",
  });
  if (error) return { ok: false, message: "Notița nu a putut fi adăugată." };

  refreshStudy(topic.subject_id, parsed.data.topicId);
  return { ok: true, message: "Notița a fost adăugată." };
}

export async function deleteFlashcard(flashcardId: string, topicId: string): Promise<StudyActionResult> {
  const parsedFlashcardId = idSchema.safeParse(flashcardId);
  const parsedTopicId = idSchema.safeParse(topicId);
  if (!parsedFlashcardId.success || !parsedTopicId.success) return { ok: false, message: "Notița nu este validă." };

  const { supabase, user } = await authenticatedContext();
  if (!user) return { ok: false, message: "Sesiunea a expirat. Intră din nou în cont." };

  const { data: topic } = await supabase
    .from("lessons")
    .select("subject_id")
    .eq("id", parsedTopicId.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!topic) return { ok: false, message: "Capitolul nu există sau nu îți aparține." };

  const { data, error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", parsedFlashcardId.data)
    .eq("lesson_id", parsedTopicId.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "Notița nu a putut fi ștearsă." };

  refreshStudy(topic.subject_id, parsedTopicId.data);
  return { ok: true, message: "Notița a fost ștearsă." };
}
