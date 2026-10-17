import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Despre Școala Mea">
        <div className="brand-mark" aria-hidden="true">
          <BookOpen size={28} strokeWidth={1.8} />
        </div>
        <div className="story-copy">
          <p className="story-kicker">Școala Mea</p>
          <h2>Tot ce contează la școală, într-un loc calm.</h2>
          <p>
            Teme, note, lecții și recapitulări organizate simplu pentru fiecare zi.
          </p>
        </div>
        <div className="story-pills" aria-hidden="true">
          <span><CheckCircle2 size={17} /> Teme sub control</span>
          <span><Sparkles size={17} /> Învățare mai ușoară</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand" aria-hidden="true">
            <span className="brand-mark brand-mark-small"><BookOpen size={22} /></span>
            <span>Școala Mea</span>
          </div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
        </div>
        <p className="privacy-note">Datele tale sunt private și protejate.</p>
      </section>
    </main>
  );
}

