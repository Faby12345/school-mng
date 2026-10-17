import type { Metadata } from "next";

import { CatalogClient } from "@/components/catalog/catalog-client";
import type { Grade, Subject } from "@/features/catalog/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catalog",
};

export default async function CatalogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, icon, color_token, sort_order, grades(id, value, assessment_type, graded_on, note, semester, created_at)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error("Catalogul nu a putut fi încărcat.");

  const subjects: Subject[] = (data ?? []).map((subject) => ({
    ...subject,
    grades: (subject.grades ?? []).map((grade) => ({
      ...grade,
      semester: grade.semester as Grade["semester"],
    })),
  }));

  return <CatalogClient subjects={subjects} />;
}

