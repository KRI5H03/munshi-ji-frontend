"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * An in-page dialog that holds a small form (never window.prompt).
 * Esc or a click outside the box closes it, unless it is busy saving.
 * Only render it in the browser (it is placed into document.body).
 * Mark the field to start in with `data-autofocus` (React's autoFocus runs before the dialog opens).
 */
export function FormDialog({
  open,
  title,
  description,
  busy,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  busy?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal focuses the first control (often a toggle). Put the cursor where typing starts instead.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Rendered at the end of <body>: the dialog's form must never sit inside another form on the page.
  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-text` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      // React passes events up its own tree even out of a portal: a submit here must not
      // reach a form the dialog was opened from (like Edit item).
      onSubmit={(event) => event.stopPropagation()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      {/* Rendered only while open, so every opening starts with a fresh form. */}
      {open && (
        <div className="p-6">
          <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {description && (
            <div id={`${id}-text`} className="mt-2 text-lg text-muted-foreground">
              {description}
            </div>
          )}
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>,
    document.body,
  );
}
