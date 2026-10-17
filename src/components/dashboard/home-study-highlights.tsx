"use client";

import { ArrowRight, BookOpenText, Eye, EyeOff, Layers3, Shuffle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type HomeChapter = {
  id: string;
  subjectId: string;
  subjectName: string;
  colorToken: string;
  title: string;
  notes: string;
  cardCount: number;
};

export type HomeFlashcard = {
  id: string;
  subjectId: string;
  topicId: string;
  subjectName: string;
  topicTitle: string;
  colorToken: string;
  question: string;
  answer: string;
};

export function HomeStudyHighlights({
  chapters,
  flashcards,
}: {
  chapters: HomeChapter[];
  flashcards: HomeFlashcard[];
}) {
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());

  function toggleCard(id: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!chapters.length && !flashcards.length) {
    return (
      <section className="home-study-empty">
        <span><BookOpenText size={25} /></span>
        <div><h2>Construiește-ți spațiul de studiu</h2><p>Adaugă capitole și notițe, iar aici vei primi sugestii rapide pentru recapitulare.</p></div>
        <Link href="/study">Începe <ArrowRight size={17} /></Link>
      </section>
    );
  }

  return (
    <div className="home-study-sections">
      {flashcards.length ? (
        <section className="dashboard-section" aria-labelledby="quick-review-title">
          <header className="dashboard-section-header">
            <div><span><Shuffle size={16} /></span><div><h2 id="quick-review-title">Recapitulare rapidă</h2><p>Carduri alese pentru azi</p></div></div>
            <Link href="/study">Toate <ArrowRight size={15} /></Link>
          </header>
          <div className="home-flashcard-grid">
            {flashcards.map((flashcard) => {
              const isRevealed = revealed.has(flashcard.id);
              return (
                <article className={`home-flashcard subject-${flashcard.colorToken}`} key={flashcard.id}>
                  <div className="home-card-context"><span>{flashcard.subjectName}</span><small>{flashcard.topicTitle}</small></div>
                  <h3>{flashcard.question}</h3>
                  <div className={`home-card-answer${isRevealed ? " is-revealed" : ""}`} aria-live="polite">
                    {isRevealed ? <p>{flashcard.answer}</p> : <p>Răspunsul este ascuns</p>}
                  </div>
                  <div className="home-card-actions">
                    <button type="button" onClick={() => toggleCard(flashcard.id)}>
                      {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}{isRevealed ? "Ascunde" : "Arată"}
                    </button>
                    <Link href={`/study/${flashcard.subjectId}/${flashcard.topicId}`} aria-label={`Deschide capitolul ${flashcard.topicTitle}`}><ArrowRight size={17} /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {chapters.length ? (
        <section className="dashboard-section" aria-labelledby="random-chapters-title">
          <header className="dashboard-section-header">
            <div><span><BookOpenText size={16} /></span><div><h2 id="random-chapters-title">Capitole de continuat</h2><p>O selecție nouă în fiecare zi</p></div></div>
            <Link href="/study">Toate <ArrowRight size={15} /></Link>
          </header>
          <div className="home-chapter-grid">
            {chapters.map((chapter) => (
              <Link className={`home-chapter-card subject-${chapter.colorToken}`} href={`/study/${chapter.subjectId}/${chapter.id}`} key={chapter.id}>
                <span className="home-chapter-icon"><BookOpenText size={19} /></span>
                <div><small>{chapter.subjectName}</small><h3>{chapter.title}</h3><p>{chapter.notes || "Deschide capitolul și adaugă ideile importante."}</p><span><Layers3 size={13} /> {chapter.cardCount} {chapter.cardCount === 1 ? "notiță" : "notițe"}</span></div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
