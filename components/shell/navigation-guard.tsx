"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnOutline, btn } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/**
 * Stops you leaving a form with unsaved changes by accident.
 * A form calls useUnsavedChanges(isDirty). While it is dirty, every GuardedLink and every
 * guarded action (like Log out) first asks "Discard changes?" in an in-page dialog.
 * Reloading or closing the tab gets the browser's own question, the only one it allows there.
 * Saving navigates with router.push, which is not guarded, so a saved form leaves freely.
 */
type Guard = {
  /** Runs `leave` at once, or after the person agrees to discard their changes. */
  confirmLeave: (leave: () => void) => void;
  /** Whether a form on the page has unsaved changes. */
  isBlocked: () => boolean;
  /** `onDiscard` runs if the person chooses "Discard changes". */
  setBlocked: (blocked: boolean, onDiscard?: () => void) => void;
};

const GuardContext = createContext<Guard | null>(null);

function useGuard(): Guard {
  const guard = useContext(GuardContext);
  if (!guard) throw new Error("NavigationGuardProvider is missing");
  return guard;
}

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  // A ref, not state: links read it when clicked, and typing must not re-render the shell.
  const blocked = useRef(false);
  const discardHandler = useRef<(() => void) | undefined>(undefined);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const guard = useMemo<Guard>(
    () => ({
      confirmLeave: (leave) => {
        if (blocked.current) setPending(() => leave);
        else leave();
      },
      isBlocked: () => blocked.current,
      setBlocked: (value, onDiscard) => {
        blocked.current = value;
        discardHandler.current = value ? onDiscard : undefined;
      },
    }),
    [],
  );

  return (
    <GuardContext.Provider value={guard}>
      {children}
      <DiscardDialog
        open={pending !== null}
        onKeep={() => setPending(null)}
        onDiscard={() => {
          const leave = pending;
          const onDiscard = discardHandler.current;
          blocked.current = false;
          discardHandler.current = undefined;
          setPending(null);
          onDiscard?.();
          leave?.();
        }}
      />
    </GuardContext.Provider>
  );
}

function DiscardDialog({ open, onKeep, onDiscard }: { open: boolean; onKeep: () => void; onDiscard: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="discard-title"
      aria-describedby="discard-text"
      // Esc closes the dialog: treat it as "Keep editing".
      onCancel={(event) => {
        event.preventDefault();
        onKeep();
      }}
      onClick={(event) => {
        // A click on the dimmed area outside the box also keeps editing.
        if (event.target === event.currentTarget) onKeep();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id="discard-title" className="text-2xl font-bold tracking-tight">
          Discard changes?
        </h2>
        <p id="discard-text" className="mt-2 text-lg text-muted-foreground">
          What you entered on this page has not been saved and will be lost.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus onClick={onKeep} className={btnOutline}>
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className={cn(btn, "bg-destructive text-white hover:bg-destructive/90")}
          >
            Discard changes
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Call in a form with its dirty state. Cleared when the form goes away or is hidden.
 * `onDiscard` runs when the person agrees to throw the changes away, so the form can start fresh.
 */
export function useUnsavedChanges(isDirty: boolean, onDiscard?: () => void) {
  const { setBlocked } = useGuard();
  const discard = useRef(onDiscard);
  useEffect(() => {
    discard.current = onDiscard;
  });

  useEffect(() => {
    setBlocked(isDirty, () => discard.current?.());
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      setBlocked(false);
    };
  }, [isDirty, setBlocked]);
}

/** For buttons that leave the page, like Log out. */
export function useConfirmLeave() {
  return useGuard().confirmLeave;
}

/** A Link that asks before leaving a form with unsaved changes. Use it for every link in the app shell and forms. */
export function GuardedLink({ onNavigate, ...props }: React.ComponentProps<typeof Link>) {
  const router = useRouter();
  const { confirmLeave, isBlocked } = useGuard();
  const href = typeof props.href === "string" ? props.href : (props.href.pathname ?? "/");

  const handleNavigate = useCallback(
    (event: { preventDefault: () => void }) => {
      onNavigate?.(event);
      if (!isBlocked()) return;
      event.preventDefault();
      confirmLeave(() => (props.replace ? router.replace(href) : router.push(href)));
    },
    [onNavigate, isBlocked, confirmLeave, router, href, props.replace],
  );

  return <Link {...props} onNavigate={handleNavigate} />;
}
