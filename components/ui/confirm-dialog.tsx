"use client";

import { useEffect, useRef } from "react";
import { btn, btnOutline } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/**
 * An in-page question with two answers (never window.confirm).
 * Focus starts on the safe answer. Esc or a click outside the box means the safe answer too.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  keepLabel,
  confirmLabel,
  busy,
  onKeep,
  onConfirm,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  keepLabel: string;
  confirmLabel: string;
  busy?: boolean;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${title.replace(/\W+/g, "-").toLowerCase()}-title`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onKeep();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onKeep();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-2 text-lg text-muted-foreground">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={busy} onClick={onKeep} className={btnOutline}>
            {keepLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={cn(btn, "bg-destructive text-white hover:bg-destructive/90")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
