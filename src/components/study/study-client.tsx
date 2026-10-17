"use client";

import {
  ArrowLeft,
  BookOpenText,
  Check,
  ChevronRight,
  FileText,
  FolderPlus,
  Layers3,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

import type { StudyFlashcard, StudyTopic } from "@/features/study/types";
import {
  deleteFlashcard,
  deleteTopic,
  saveFlashcard,
  saveTopic,
  type StudyActionResult,
} from "@/server/actions/study";

type SubjectHeader = { id: string; name: string; color_token: string };

function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return { toast, setToast };
}

export function TopicWorkspace({ subject, topics }: { subject: SubjectHeader; topics: StudyTopic[] }) {
  const router = useRouter();
  const { toast, setToast } = useToast();
  const [editor, setEditor] = useState<StudyTopic | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyTopic | null>(null);
  const noteCount = topics.reduce((sum, topic) => sum + topic.flashcards.length, 0);

  function completed(message: string) {
    setToast(message);
    setEditor(null);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <main className={`study-page subject-${subject.color_token}`}>
      <header className="workspace-header page-enter">
        <div className="workspace-breadcrumb">
          <Link href="/study" aria-label="Înapoi la materii"><ArrowLeft size={19} /></Link>
          <span>Învață</span>
        </div>
        <div className="workspace-heading-row">
          <div>
            <p className="eyebrow">Spațiu de materie</p>
            <h1>{subject.name}</h1>
            <p>{topics.length} {topics.length === 1 ? "capitol" : "capitole"} · {noteCount} {noteCount === 1 ? "notiță" : "notițe"}</p>
          </div>
          <button className="primary-action" type="button" onClick={() => setEditor("new")}>
            <FolderPlus size={18} /><span>Capitol nou</span>
          </button>
        </div>
      </header>

      {topics.length ? (
        <section className="topic-grid" aria-label={`Capitole pentru ${subject.name}`}>
          {topics.map((topic, index) => (
            <article className="topic-card" key={topic.id} style={{ animationDelay: `${index * 45}ms` }}>
              <Link className="topic-card-link" href={`/study/${subject.id}/${topic.id}`}>
                <span className="topic-icon"><BookOpenText size={21} /></span>
                <div>
                  <h2>{topic.title}</h2>
                  <p>{topic.notes || "Fără descriere"}</p>
                  <span className="topic-count"><Layers3 size={14} /> {topic.flashcards.length} {topic.flashcards.length === 1 ? "notiță" : "notițe"}</span>
                </div>
                <ChevronRight size={19} aria-hidden="true" />
              </Link>
              <div className="topic-actions">
                <button type="button" onClick={() => setEditor(topic)} aria-label={`Editează ${topic.title}`}><Pencil size={16} /> Editează</button>
                <button className="is-danger" type="button" onClick={() => setDeleteTarget(topic)} aria-label={`Șterge ${topic.title}`}><Trash2 size={16} /> Șterge</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="study-empty page-enter">
          <span><FolderPlus size={36} /></span>
          <h2>Adaugă primul capitol</h2>
          <p>De exemplu: Funcții, Derivate sau Ecuații. Apoi vei putea adăuga notițe esențiale în fiecare.</p>
          <button className="primary-action" type="button" onClick={() => setEditor("new")}><Plus size={18} /> Adaugă un capitol</button>
        </section>
      )}

      {editor ? (
        <TopicEditor
          subjectId={subject.id}
          topic={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
          onSuccess={completed}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          title={`Ștergi „${deleteTarget.title}”?`}
          description={`Se vor șterge definitiv și cele ${deleteTarget.flashcards.length} ${deleteTarget.flashcards.length === 1 ? "notiță" : "notițe"} din acest capitol.`}
          confirmLabel="Șterge capitolul"
          action={() => deleteTopic(deleteTarget.id, subject.id)}
          onClose={() => setDeleteTarget(null)}
          onSuccess={completed}
        />
      ) : null}

      {toast ? <div className="toast" role="status"><Check size={17} /> {toast}</div> : null}
    </main>
  );
}

export function FlashcardWorkspace({
  subject,
  topic,
}: {
  subject: SubjectHeader;
  topic: Omit<StudyTopic, "updated_at" | "flashcards"> & { flashcards: StudyFlashcard[] };
}) {
  const router = useRouter();
  const { toast, setToast } = useToast();
  const [editor, setEditor] = useState<StudyFlashcard | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyFlashcard | null>(null);

  function completed(message: string) {
    setToast(message);
    setEditor(null);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <main className={`study-page subject-${subject.color_token}`}>
      <header className="workspace-header page-enter">
        <div className="workspace-breadcrumb">
          <Link href={`/study/${subject.id}`} aria-label={`Înapoi la ${subject.name}`}><ArrowLeft size={19} /></Link>
          <span>{subject.name}</span>
        </div>
        <div className="workspace-heading-row">
          <div>
            <p className="eyebrow">Capitol</p>
            <h1>{topic.title}</h1>
            <p>{topic.notes || "Ideile importante pentru acest capitol."}</p>
          </div>
          <button className="primary-action" type="button" onClick={() => setEditor("new")}>
            <Plus size={18} /><span>Notiță nouă</span>
          </button>
        </div>
      </header>

      {topic.flashcards.length ? (
        <section className="flashcard-grid" aria-label={`Notițe pentru ${topic.title}`}>
          {topic.flashcards.map((flashcard, index) => (
            <article className="note-card" key={flashcard.id} style={{ animationDelay: `${index * 40}ms` }}>
              <header>
                <span><FileText size={17} /></span>
                <div className="note-actions">
                  <button type="button" onClick={() => setEditor(flashcard)} aria-label={`Editează ${flashcard.question}`}><Pencil size={16} /></button>
                  <button type="button" onClick={() => setDeleteTarget(flashcard)} aria-label={`Șterge ${flashcard.question}`}><Trash2 size={16} /></button>
                </div>
              </header>
              <h2>{flashcard.question}</h2>
              <p>{flashcard.answer}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="study-empty page-enter">
          <span><FileText size={36} /></span>
          <h2>Nu ai notițe în acest capitol</h2>
          <p>Adaugă formule, definiții sau idei-cheie pe care vrei să le găsești rapid.</p>
          <button className="primary-action" type="button" onClick={() => setEditor("new")}><Plus size={18} /> Adaugă prima notiță</button>
        </section>
      )}

      {editor ? (
        <FlashcardEditor
          topicId={topic.id}
          flashcard={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
          onSuccess={completed}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteDialog
          title={`Ștergi „${deleteTarget.question}”?`}
          description="Notița va fi ștearsă definitiv din acest capitol."
          confirmLabel="Șterge notița"
          action={() => deleteFlashcard(deleteTarget.id, topic.id)}
          onClose={() => setDeleteTarget(null)}
          onSuccess={completed}
        />
      ) : null}

      {toast ? <div className="toast" role="status"><Check size={17} /> {toast}</div> : null}
    </main>
  );
}

function TopicEditor({
  subjectId,
  topic,
  onClose,
  onSuccess,
}: {
  subjectId: string;
  topic?: StudyTopic;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveTopic(formData);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  return (
    <EditorShell title={topic ? "Editează capitolul" : "Capitol nou"} pending={pending} onClose={onClose}>
      <form className="sheet-form" onSubmit={submit}>
        <input name="topicId" type="hidden" value={topic?.id ?? ""} />
        <input name="subjectId" type="hidden" value={subjectId} />
        <label className="field-group"><span>Titlul capitolului</span><input name="title" defaultValue={topic?.title ?? ""} placeholder="Ex: Funcții" minLength={2} maxLength={100} autoFocus required /></label>
        <label className="field-group"><span>Descriere <small>opțional</small></span><textarea name="notes" defaultValue={topic?.notes ?? ""} placeholder="Ce vei păstra în acest capitol?" rows={4} maxLength={2000} /></label>
        {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
        <button className="primary-action sheet-submit" type="submit" disabled={pending}>{pending ? "Se salvează…" : topic ? "Salvează modificările" : "Adaugă capitolul"}</button>
      </form>
    </EditorShell>
  );
}

function FlashcardEditor({
  topicId,
  flashcard,
  onClose,
  onSuccess,
}: {
  topicId: string;
  flashcard?: StudyFlashcard;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveFlashcard(formData);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  return (
    <EditorShell title={flashcard ? "Editează notița" : "Notiță nouă"} pending={pending} onClose={onClose}>
      <form className="sheet-form" onSubmit={submit}>
        <input name="flashcardId" type="hidden" value={flashcard?.id ?? ""} />
        <input name="topicId" type="hidden" value={topicId} />
        <label className="field-group"><span>Titlu sau idee-cheie</span><input name="title" defaultValue={flashcard?.question ?? ""} placeholder="Ex: Formula derivatei" minLength={2} maxLength={160} autoFocus required /></label>
        <label className="field-group"><span>Notița</span><textarea name="content" defaultValue={flashcard?.answer ?? ""} placeholder="Scrie explicația, formula sau definiția…" rows={8} maxLength={3000} required /></label>
        {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
        <button className="primary-action sheet-submit" type="submit" disabled={pending}>{pending ? "Se salvează…" : flashcard ? "Salvează modificările" : "Adaugă notița"}</button>
      </form>
    </EditorShell>
  );
}

function EditorShell({
  title,
  pending,
  onClose,
  children,
}: {
  title: string;
  pending: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, pending]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}>
      <section className="sheet sheet-compact" role="dialog" aria-modal="true" aria-labelledby="study-editor-title">
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header"><div><p className="eyebrow">Spațiu de studiu</p><h2 id="study-editor-title">{title}</h2></div><button className="sheet-close" type="button" onClick={onClose} disabled={pending} aria-label="Închide"><X size={20} /></button></header>
        {children}
      </section>
    </div>
  );
}

function ConfirmDeleteDialog({
  title,
  description,
  confirmLabel,
  action,
  onClose,
  onSuccess,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  action: () => Promise<StudyActionResult>;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}>
      <section className="sheet sheet-compact delete-sheet" role="alertdialog" aria-modal="true" aria-labelledby="study-delete-title" aria-describedby="study-delete-description">
        <div className="sheet-handle" aria-hidden="true" />
        <span className="delete-icon" aria-hidden="true"><TriangleAlert size={25} /></span>
        <h2 id="study-delete-title">{title}</h2>
        <p id="study-delete-description">{description}</p>
        {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
        <div className="delete-actions"><button className="secondary-button" type="button" onClick={onClose} disabled={pending}>Anulează</button><button className="danger-button" type="button" onClick={confirm} disabled={pending}><Trash2 size={17} /> {pending ? "Se șterge…" : confirmLabel}</button></div>
      </section>
    </div>
  );
}
