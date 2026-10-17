export default function StudyLoading() {
  return (
    <main className="study-page" aria-label="Se încarcă spațiul de studiu">
      <div className="skeleton skeleton-kicker" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <section className="workspace-grid loading-grid">
        {Array.from({ length: 6 }, (_, index) => <div className="skeleton study-skeleton-card" key={index} />)}
      </section>
    </main>
  );
}
