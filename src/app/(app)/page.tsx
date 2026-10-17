import { BookOpenText, CalendarCheck2, GraduationCap, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

import {
  HomeStudyHighlights,
  type HomeChapter,
  type HomeFlashcard,
} from "@/components/dashboard/home-study-highlights";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "../(auth)/actions";

function dailyScore(id: string) {
  const date = new Date();
  const seed = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${id}`;
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dailySelection<T extends { id: string }>(items: T[], count: number) {
  return [...items].sort((a, b) => dailyScore(a.id) - dailyScore(b.id)).slice(0, count);
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subjects }, { data: lessons }, { data: cards }] = user
    ? await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("subjects").select("id, name, color_token").order("sort_order", { ascending: true }),
        supabase.from("lessons").select("id, subject_id, title, notes"),
        supabase.from("flashcards").select("id, lesson_id, question, answer"),
      ])
    : [{ data: null }, { data: [] }, { data: [] }, { data: [] }];

  const name = profile?.display_name || user?.email?.split("@")[0] || "Bun venit";
  const subjectMap = new Map((subjects ?? []).map((subject) => [subject.id, subject]));
  const lessonMap = new Map((lessons ?? []).map((lesson) => [lesson.id, lesson]));
  const cardCountByLesson = new Map<string, number>();
  for (const card of cards ?? []) cardCountByLesson.set(card.lesson_id, (cardCountByLesson.get(card.lesson_id) ?? 0) + 1);

  const chapterOptions: HomeChapter[] = (lessons ?? []).flatMap((lesson) => {
    const subject = subjectMap.get(lesson.subject_id);
    return subject
      ? [{ id: lesson.id, subjectId: subject.id, subjectName: subject.name, colorToken: subject.color_token, title: lesson.title, notes: lesson.notes, cardCount: cardCountByLesson.get(lesson.id) ?? 0 }]
      : [];
  });
  const flashcardOptions: HomeFlashcard[] = (cards ?? []).flatMap((card) => {
    const lesson = lessonMap.get(card.lesson_id);
    const subject = lesson ? subjectMap.get(lesson.subject_id) : undefined;
    return lesson && subject
      ? [{ id: card.id, subjectId: subject.id, topicId: lesson.id, subjectName: subject.name, topicTitle: lesson.title, colorToken: subject.color_token, question: card.question, answer: card.answer }]
      : [];
  });
  const selectedChapters = dailySelection(chapterOptions, 3);
  const selectedFlashcards = dailySelection(flashcardOptions, 3);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Școala Mea</p>
          <h1>Salut, {name}!</h1>
          <p>Alege un pas mic pentru azi și continuă de unde ai rămas.</p>
        </div>
        <form action={signOut}>
          <button className="icon-button" type="submit" aria-label="Deconectare" title="Deconectare">
            <LogOut size={20} />
          </button>
        </form>
      </header>

      <section className="welcome-card">
        <span className="welcome-icon"><Sparkles size={26} /></span>
        <div>
          <p className="card-label">Pentru azi</p>
          <h2>{flashcardOptions.length ? `${flashcardOptions.length} notițe pregătite pentru recapitulare.` : "Spațiul tău de studiu este pregătit."}</h2>
          <p>{chapterOptions.length ? `Ai ${chapterOptions.length} capitole în care poți continua să adaugi idei importante.` : "Creează primul capitol și vei primi aici sugestii zilnice."}</p>
        </div>
      </section>

      <HomeStudyHighlights chapters={selectedChapters} flashcards={selectedFlashcards} />

      <section className="feature-grid" aria-label="Secțiunile aplicației">
        <Link className="feature-card-link" href="/catalog"><article><GraduationCap /><h3>Catalog</h3><p>Materii, note și medii.</p></article></Link>
        <article><CalendarCheck2 /><h3>Teme</h3><p>Astăzi, urmează și finalizate.</p></article>
        <Link className="feature-card-link" href="/study"><article><BookOpenText /><h3>Învață</h3><p>Capitole și notițe importante.</p></article></Link>
      </section>
    </main>
  );
}

