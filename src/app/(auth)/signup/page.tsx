import { LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";

import { signUp } from "../actions";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      eyebrow="Un început simplu"
      title="Creează contul"
      description="Configurează accesul privat la spațiul tău pentru școală."
    >
      {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}

      <form className="auth-form" action={signUp}>
        <label className="field-group">
          <span>Nume</span>
          <span className="input-wrap">
            <UserRound size={18} aria-hidden="true" />
            <input name="displayName" type="text" autoComplete="name" placeholder="Prenumele tău" required autoFocus />
          </span>
        </label>

        <label className="field-group">
          <span>Email</span>
          <span className="input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input name="email" type="email" autoComplete="email" inputMode="email" placeholder="nume@exemplu.ro" required />
          </span>
        </label>

        <label className="field-group">
          <span>Parolă</span>
          <span className="input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Minimum 8 caractere" required />
          </span>
        </label>

        <label className="field-group">
          <span>Confirmă parola</span>
          <span className="input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} placeholder="Scrie parola din nou" required />
          </span>
        </label>

        <SubmitButton idleLabel="Creează contul" pendingLabel="Se creează…" />
      </form>

      <p className="auth-switch">
        Ai deja cont? <Link href="/login">Intră în cont</Link>
      </p>
    </AuthShell>
  );
}

