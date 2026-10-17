import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FlashcardWorkspace } from "@/components/study/study-client";
import type { StudyFlashcard } from "@/features/study/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notițe de studiu" };

export default async function TopicStudyPage({
  params,
}: {
  params: Promise<{ subjectId: string; topicId: string }>;
}) {
  const { subjectId, topicId } = await params;
  const supabase = await createClient();

  const [{ data: subject }, { data: topic, error }] = await Promise.all([
    supabase.from("subjects").select("id, name, color_token").eq("id", subjectId).maybeSingle(),
    supabase
      .from("lessons")
      .select("id, title, notes, flashcards(id, question, answer, source, created_at, updated_at)")
      .eq("id", topicId)
      .eq("subject_id", subjectId)
      .maybeSingle(),
  ]);

  if (!subject || !topic) notFound();
  if (error) throw new Error("Notițele nu au putut fi încărcate.");

  const flashcards = [...((topic.flashcards ?? []) as StudyFlashcard[])].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );

  return <FlashcardWorkspace subject={subject} topic={{ ...topic, flashcards }} />;
}
