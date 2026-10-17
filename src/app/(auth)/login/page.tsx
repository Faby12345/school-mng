import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";

import { signIn } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Bine ai revenit"
      title="Intră în cont"
      description="Continuă de unde ai rămas și vezi ce ai de făcut astăzi."
    >
      {params.error ? <p className="form-alert form-alert-error" role="alert">{params.error}</p> : null}
      {params.message ? <p className="form-alert form-alert-success" role="status">{params.message}</p> : null}

      <form className="auth-form" action={signIn}>
        <label className="field-group">
          <span>Email</span>
          <span className="input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nume@exemplu.ro"
              required
              autoFocus
            />
          </span>
        </label>

        <label className="field-group">
          <span>Parolă</span>
          <span className="input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Parola ta"
              required
            />
          </span>
        </label>

        <SubmitButton idleLabel="Intră în cont" pendingLabel="Se verifică…" />
      </form>

      <p className="auth-switch">
        Nu ai cont? <Link href="/signup">Creează unul</Link>
      </p>
    </AuthShell>
  );
}

