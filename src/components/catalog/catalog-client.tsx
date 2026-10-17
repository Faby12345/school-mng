"use client";

import {
  Atom,
  BookOpen,
  BookPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Dna,
  FlaskConical,
  Globe2,
  GraduationCap,
  Landmark,
  Languages,
  MessageCircle,
  Plus,
  Sigma,
  Sparkles,
  Trash2,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import type { Grade, Subject } from "@/features/catalog/types";
import {
  calculateGeneralAverage,
  calculateSubjectAverage,
  formatAverage,
} from "@/features/grades/calculations";
import { addDefaultSubjects, createSubject, deleteGrade, deleteSubject, saveGrade } from "@/server/actions/catalog";

type SubjectView = Subject & {
  average: number | null;
};

const subjectIcons = {
  Atom,
  BookOpen,
  Code2,
  Dna,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  MessageCircle,
  Sigma,
  UsersRound,
} as const;

const assessmentTypes = ["Test", "Lucrare", "Ascultare", "Proiect", "Teză", "Altele"];
const colorTokens = ["blue", "violet", "green", "orange", "rose", "cyan"] as const;

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function averageTone(value: number | null) {
  if (value === null) return "empty";
  if (value >= 9) return "excellent";
  if (value >= 7) return "good";
  if (value >= 5) return "attention";
  return "danger";
}

export function CatalogClient({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [gradeEditor, setGradeEditor] = useState<{ subjectId: string; grade?: Grade } | null>(null);
  const [showSubjectEditor, setShowSubjectEditor] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubjectView | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subjectViews = useMemo<SubjectView[]>(
    () => subjects.map((subject) => ({ ...subject, average: calculateSubjectAverage(subject.grades) })),
    [subjects],
  );

  const generalAverage = calculateGeneralAverage(subjectViews);
  const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function completeAction(message: string) {
    setToast(message);
    setGradeEditor(null);
    setShowSubjectEditor(false);
    setDeleteTarget(null);
    router.refresh();
  }

  function addRecommended() {
    startTransition(async () => {
      const result = await addDefaultSubjects();
      if (result.ok) completeAction(result.message);
      else setToast(result.message);
    });
  }

  return (
    <main className="catalog-page">
      <header className="catalog-header page-enter">
        <div>
          <p className="eyebrow">Catalog personal</p>
          <h1>Note și medii</h1>
          <p>Vezi progresul fără calcule făcute de mână.</p>
        </div>
        <div className="catalog-actions">
          <button className="secondary-button" type="button" onClick={() => setShowSubjectEditor(true)}>
            <BookPlus size={18} />
            <span>Materie</span>
          </button>
          <button
            className="primary-action"
            type="button"
            onClick={() => subjects[0] && setGradeEditor({ subjectId: subjects[0].id })}
            disabled={subjects.length === 0}
          >
            <Plus size={19} />
            <span>Adaugă notă</span>
          </button>
        </div>
      </header>

      {subjects.length === 0 ? (
        <section className="catalog-empty page-enter" aria-labelledby="empty-title">
          <span className="empty-illustration"><GraduationCap size={42} /></span>
          <p className="eyebrow">Catalogul tău e pregătit</p>
          <h2 id="empty-title">Începe cu materiile de clasa a VIII-a</h2>
          <p>Le poți adăuga pe toate într-un singur pas și modifica apoi catalogul cum dorești.</p>
          <div className="empty-actions">
            <button className="primary-action" type="button" onClick={addRecommended} disabled={isPending}>
              <Sparkles size={18} />
              {isPending ? "Se adaugă…" : "Adaugă materiile recomandate"}
            </button>
            <button className="text-button" type="button" onClick={() => setShowSubjectEditor(true)}>
              Adaug doar o materie <ChevronRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="average-overview page-enter" aria-label="Rezumatul mediilor">
            <div className="general-average">
              <span className={`average-orb tone-${averageTone(generalAverage)}`}>
                {formatAverage(generalAverage)}
              </span>
              <div>
                <p>Media generală</p>
                <strong>Anul școlar</strong>
              </div>
            </div>
            <div className="overview-meta">
              <span><strong>{subjects.length}</strong> materii</span>
              <span><strong>{totalGrades}</strong> note</span>
            </div>
          </section>

          <section className="catalog-section-heading">
            <div>
              <h2>Materiile tale</h2>
              <p>Apasă pe o notă pentru a o modifica.</p>
            </div>
            <button className="quiet-button" type="button" onClick={addRecommended} disabled={isPending}>
              <Sparkles size={16} /> Completează lista
            </button>
          </section>

          <section className="subject-grid" aria-live="polite">
            {subjectViews.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                delay={index * 45}
                onAdd={() => setGradeEditor({ subjectId: subject.id })}
                onEdit={(grade) => setGradeEditor({ subjectId: subject.id, grade })}
                onDelete={() => setDeleteTarget(subject)}
              />
            ))}
          </section>
        </>
      )}

      {gradeEditor ? (
        <GradeEditor
          key={`${gradeEditor.grade?.id ?? "new"}-${gradeEditor.subjectId}`}
          subjects={subjects}
          initialSubjectId={gradeEditor.subjectId}
          grade={gradeEditor.grade}
          onClose={() => setGradeEditor(null)}
          onSuccess={completeAction}
        />
      ) : null}

      {showSubjectEditor ? (
        <SubjectEditor onClose={() => setShowSubjectEditor(false)} onSuccess={completeAction} />
      ) : null}

      {deleteTarget ? (
        <DeleteSubjectDialog
          subject={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={completeAction}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          <Check size={17} /> {toast}
        </div>
      ) : null}
    </main>
  );
}

function SubjectCard({
  subject,
  delay,
  onAdd,
  onEdit,
  onDelete,
}: {
  subject: SubjectView;
  delay: number;
  onAdd: () => void;
  onEdit: (grade: Grade) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = subjectIcons[subject.icon as keyof typeof subjectIcons] ?? BookOpen;
  const sortedGrades = [...subject.grades].sort((a, b) => b.graded_on.localeCompare(a.graded_on));
  const visibleGrades = expanded ? sortedGrades : sortedGrades.slice(0, 8);
  const hiddenGradeCount = sortedGrades.length - visibleGrades.length;

  return (
    <article className={`subject-card subject-${subject.color_token}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="subject-card-top">
        <span className="subject-icon"><Icon size={21} /></span>
        <div className="subject-card-actions">
          <button className="mini-action" type="button" onClick={onAdd} aria-label={`Adaugă notă la ${subject.name}`}>
            <Plus size={18} />
          </button>
          <button className="mini-action mini-action-danger" type="button" onClick={onDelete} aria-label={`Șterge materia ${subject.name}`}>
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <div className="subject-title-row">
        <div>
          <h3>{subject.name}</h3>
          <p>{subject.grades.length === 1 ? "1 notă" : `${subject.grades.length} note`} în total</p>
        </div>
        <span className={`subject-average tone-${averageTone(subject.average)}`}>{formatAverage(subject.average)}</span>
      </div>

      {visibleGrades.length ? (
        <div className="grade-collection">
          <div className="grade-grid">
            {visibleGrades.map((grade) => (
              <button
                key={grade.id}
                type="button"
                className="grade-tile"
                onClick={() => onEdit(grade)}
                aria-label={`Editează nota ${grade.value}, ${grade.assessment_type}, ${formatDate(grade.graded_on)}`}
                title={`${grade.assessment_type} · ${formatDate(grade.graded_on)}`}
              >
                <strong className={`grade-value grade-${grade.value}`}>{grade.value}</strong>
                <span>{grade.assessment_type}</span>
                <small>{formatDate(grade.graded_on)}</small>
              </button>
            ))}
          </div>
          {sortedGrades.length > 8 ? (
            <button className="grade-expand" type="button" onClick={() => setExpanded((current) => !current)}>
              <ChevronDown size={15} className={expanded ? "is-open" : ""} />
              {expanded ? "Arată mai puține" : `Încă ${hiddenGradeCount} ${hiddenGradeCount === 1 ? "notă" : "note"}`}
            </button>
          ) : null}
        </div>
      ) : (
        <button className="subject-empty" type="button" onClick={onAdd}>
          <Plus size={16} /> Nicio notă în acest an
        </button>
      )}
    </article>
  );
}

function DeleteSubjectDialog({
  subject,
  onClose,
  onSuccess,
}: {
  subject: SubjectView;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, pending]);

  function removeSubject() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  const gradeLabel = subject.grades.length === 1 ? "1 notă" : `${subject.grades.length} note`;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}>
      <section className="sheet sheet-compact delete-sheet" role="alertdialog" aria-modal="true" aria-labelledby="delete-subject-title" aria-describedby="delete-subject-description">
        <div className="sheet-handle" aria-hidden="true" />
        <span className="delete-icon" aria-hidden="true"><TriangleAlert size={25} /></span>
        <h2 id="delete-subject-title">Ștergi „{subject.name}”?</h2>
        <p id="delete-subject-description">
          Se vor șterge definitiv {gradeLabel} și tot conținutul de învățare legat de această materie.
          Temele vor rămâne salvate, dar fără materie asociată.
        </p>
        {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
        <div className="delete-actions">
          <button className="secondary-button" type="button" onClick={onClose} disabled={pending}>Anulează</button>
          <button className="danger-button" type="button" onClick={removeSubject} disabled={pending}>
            <Trash2 size={17} /> {pending ? "Se șterge…" : "Șterge materia"}
          </button>
        </div>
      </section>
    </div>
  );
}

function GradeEditor({
  subjects,
  initialSubjectId,
  grade,
  onClose,
  onSuccess,
}: {
  subjects: Subject[];
  initialSubjectId: string;
  grade?: Grade;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [value, setValue] = useState(grade?.value ?? 10);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, pending]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingAction("save");
    const formData = new FormData(event.currentTarget);
    formData.set("value", String(value));

    startTransition(async () => {
      const result = await saveGrade(formData);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  function removeGrade() {
    if (!grade) return;
    setError(null);
    setPendingAction("delete");
    startTransition(async () => {
      const result = await deleteGrade(grade.id);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}>
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="grade-editor-title">
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            <p className="eyebrow">{grade ? "Modificare" : "Notă nouă"}</p>
            <h2 id="grade-editor-title">{grade ? "Editează nota" : "Adaugă o notă"}</h2>
          </div>
          <button className="sheet-close" type="button" onClick={onClose} aria-label="Închide" disabled={pending}><X size={20} /></button>
        </header>

        <form className="sheet-form" onSubmit={submit}>
          <input type="hidden" name="gradeId" value={grade?.id ?? ""} />

          <label className="field-group">
            <span>Materia</span>
            <select name="subjectId" defaultValue={initialSubjectId} required>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>

          <fieldset className="form-fieldset">
            <legend>Nota</legend>
            <div className="grade-picker">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((gradeValue) => (
                <button
                  key={gradeValue}
                  type="button"
                  className={value === gradeValue ? "is-selected" : ""}
                  onClick={() => setValue(gradeValue)}
                  aria-pressed={value === gradeValue}
                >
                  {gradeValue}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="form-row">
            <label className="field-group">
              <span>Tip evaluare</span>
              <select name="assessmentType" defaultValue={grade?.assessment_type ?? "Test"} required>
                {assessmentTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="field-group">
              <span>Data</span>
              <input name="gradedOn" type="date" defaultValue={grade?.graded_on ?? today()} required />
            </label>
          </div>

          <label className="field-group">
            <span>Observație <small>opțional</small></span>
            <textarea name="note" defaultValue={grade?.note ?? ""} rows={3} placeholder="Ex: capitolul ecuații" maxLength={500} />
          </label>

          {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
          {grade && confirmingDelete ? (
            <div className="grade-delete-confirm" role="alert">
              <div>
                <strong>Ștergi nota {grade.value}?</strong>
                <span>Această acțiune nu poate fi anulată.</span>
              </div>
              <div>
                <button className="text-button" type="button" onClick={() => setConfirmingDelete(false)} disabled={pending}>Păstrează</button>
                <button className="danger-button" type="button" onClick={removeGrade} disabled={pending}>
                  <Trash2 size={17} /> {pending && pendingAction === "delete" ? "Se șterge…" : "Șterge"}
                </button>
              </div>
            </div>
          ) : (
            <div className={`sheet-action-row${grade ? " has-delete" : ""}`}>
              {grade ? (
                <button className="delete-grade-button" type="button" onClick={() => setConfirmingDelete(true)} disabled={pending}>
                  <Trash2 size={17} /> Șterge nota
                </button>
              ) : null}
              <button className="primary-action sheet-submit" type="submit" disabled={pending}>
                {pending && pendingAction === "save" ? "Se salvează…" : grade ? "Salvează" : "Adaugă nota"}
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function SubjectEditor({ onClose, onSuccess }: { onClose: () => void; onSuccess: (message: string) => void }) {
  const [color, setColor] = useState<(typeof colorTokens)[number]>("blue");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("colorToken", color);
    startTransition(async () => {
      const result = await createSubject(formData);
      if (result.ok) onSuccess(result.message);
      else setError(result.message);
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sheet sheet-compact" role="dialog" aria-modal="true" aria-labelledby="subject-editor-title">
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header">
          <div><p className="eyebrow">Catalog</p><h2 id="subject-editor-title">Materie nouă</h2></div>
          <button className="sheet-close" type="button" onClick={onClose} aria-label="Închide"><X size={20} /></button>
        </header>
        <form className="sheet-form" onSubmit={submit}>
          <label className="field-group">
            <span>Numele materiei</span>
            <input name="name" type="text" placeholder="Ex: Matematică" minLength={2} maxLength={80} autoFocus required />
          </label>
          <fieldset className="form-fieldset">
            <legend>Culoare</legend>
            <div className="color-picker">
              {colorTokens.map((token) => (
                <button
                  key={token}
                  type="button"
                  className={`color-${token} ${color === token ? "is-selected" : ""}`}
                  onClick={() => setColor(token)}
                  aria-label={`Culoare ${token}`}
                  aria-pressed={color === token}
                >
                  {color === token ? <Check size={15} /> : null}
                </button>
              ))}
            </div>
          </fieldset>
          {error ? <p className="form-alert form-alert-error" role="alert">{error}</p> : null}
          <button className="primary-action sheet-submit" type="submit" disabled={pending}>
            {pending ? "Se salvează…" : "Adaugă materia"}
          </button>
        </form>
      </section>
    </div>
  );
}

