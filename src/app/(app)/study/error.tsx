"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function StudyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="study-page">
      <section className="study-empty">
        <span className="error-illustration"><AlertCircle size={36} /></span>
        <h1>Nu am putut încărca spațiul de studiu</h1>
        <p>Verifică conexiunea și încearcă din nou.</p>
        <button className="primary-action" type="button" onClick={reset}><RotateCcw size={17} /> Reîncearcă</button>
      </section>
    </main>
  );
}
