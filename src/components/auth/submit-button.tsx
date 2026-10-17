"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function SubmitButton({ idleLabel, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" type="submit" disabled={pending}>
      <span>{pending ? pendingLabel : idleLabel}</span>
      <span className="button-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}

