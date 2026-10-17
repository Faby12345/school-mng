import { BookOpenText, CalendarCheck2, GraduationCap, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "../(auth)/actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const name = profile?.display_name || user?.email?.split("@")[0] || "Bun venit";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Școala Mea</p>
          <h1>Salut, {name}!</h1>
          <p>Contul tău este conectat și gata pentru următorul pas.</p>
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
          <p className="card-label">Conexiune reușită</p>
          <h2>Supabase Auth și profilul sunt active.</h2>
          <p>Următoarele funcții vor apărea aici pe măsură ce construim aplicația.</p>
        </div>
      </section>

      <section className="feature-grid" aria-label="Secțiunile aplicației">
        <Link className="feature-card-link" href="/catalog"><article><GraduationCap /><h3>Catalog</h3><p>Materii, note și medii.</p></article></Link>
        <article><CalendarCheck2 /><h3>Teme</h3><p>Astăzi, urmează și finalizate.</p></article>
        <article><BookOpenText /><h3>Învață</h3><p>Lecții și flashcarduri.</p></article>
      </section>
    </main>
  );
}

