"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <main className="catalog-page">
      <section className="catalog-empty">
        <span className="empty-illustration error-illustration"><TriangleAlert size={38} /></span>
        <p className="eyebrow">Ceva nu a mers</p>
        <h1>Catalogul nu s-a încărcat</h1>
        <p>Conexiunea poate fi temporar indisponibilă. Notele tale sunt în siguranță.</p>
        <button className="primary-action" type="button" onClick={reset}><RefreshCw size={17} /> Încearcă din nou</button>
      </section>
    </main>
  );
}

