import { ArrowRight, BookOpenText, FolderOpen, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import type { StudySubject } from "@/features/study/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Învață" };

export default async function StudyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, icon, color_token, lessons(id, flashcards(id))")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error("Spațiile de studiu nu au putut fi încărcate.");
  const subjects = (data ?? []) as StudySubject[];
  const topicCount = subjects.reduce((total, subject) => total + subject.lessons.length, 0);
  const cardCount = subjects.reduce(
    (total, subject) => total + subject.lessons.reduce((sum, topic) => sum + topic.flashcards.length, 0),
    0,
  );

  return (
    <main className="study-page">
      <header className="study-hero page-enter">
        <div>
          <p className="eyebrow">Spațiul tău de studiu</p>
          <h1>Învață pe capitole</h1>
          <p>Alege o materie, organizează capitolele și păstrează ideile importante în carduri ușor de găsit.</p>
        </div>
        <div className="study-summary" aria-label="Rezumat studiu">
          <span><FolderOpen size={18} /><strong>{topicCount}</strong> capitole</span>
          <span><Layers3 size={18} /><strong>{cardCount}</strong> notițe</span>
        </div>
      </header>

      {subjects.length ? (
        <section className="workspace-grid" aria-label="Materii">
          {subjects.map((subject, index) => {
            const subjectCards = subject.lessons.reduce((sum, topic) => sum + topic.flashcards.length, 0);
            return (
              <Link
                className={`workspace-card subject-${subject.color_token}`}
                href={`/study/${subject.id}`}
                key={subject.id}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span className="workspace-icon"><BookOpenText size={22} /></span>
                <div>
                  <h2>{subject.name}</h2>
                  <p>{subject.lessons.length} {subject.lessons.length === 1 ? "capitol" : "capitole"} · {subjectCards} {subjectCards === 1 ? "notiță" : "notițe"}</p>
                </div>
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="study-empty page-enter">
          <span><BookOpenText size={36} /></span>
          <h2>Mai întâi adaugă o materie</h2>
          <p>Fiecare materie devine automat un spațiu pentru capitole și notițe.</p>
          <Link className="primary-action" href="/catalog">Deschide catalogul <ArrowRight size={17} /></Link>
        </section>
      )}
    </main>
  );
}
