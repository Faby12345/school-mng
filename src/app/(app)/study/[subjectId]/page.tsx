import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TopicWorkspace } from "@/components/study/study-client";
import type { StudyTopic } from "@/features/study/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Capitole" };

export default async function SubjectStudyPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  const supabase = await createClient();

  const [{ data: subject }, { data: topics, error }] = await Promise.all([
    supabase.from("subjects").select("id, name, color_token").eq("id", subjectId).maybeSingle(),
    supabase
      .from("lessons")
      .select("id, title, notes, updated_at, flashcards(id)")
      .eq("subject_id", subjectId)
      .order("updated_at", { ascending: false }),
  ]);

  if (!subject) notFound();
  if (error) throw new Error("Capitolele nu au putut fi încărcate.");

  return <TopicWorkspace subject={subject} topics={(topics ?? []) as StudyTopic[]} />;
}
