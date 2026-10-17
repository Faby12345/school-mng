export default function CatalogLoading() {
  return (
    <main className="catalog-page" aria-busy="true" aria-label="Se încarcă catalogul">
      <header className="catalog-header">
        <div><span className="skeleton skeleton-kicker" /><span className="skeleton skeleton-title" /><span className="skeleton skeleton-copy" /></div>
        <span className="skeleton skeleton-button" />
      </header>
      <span className="skeleton skeleton-overview" />
      <section className="subject-grid loading-grid">
        {Array.from({ length: 6 }, (_, index) => <span className="skeleton skeleton-card" key={index} />)}
      </section>
    </main>
  );
}

