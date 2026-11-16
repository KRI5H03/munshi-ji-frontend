"use client";

import { useId, useState } from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { inputCls } from "@/components/ui/kit";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Props<T> = {
  /** Fixed id for the input, so other code can focus it. */
  id?: string;
  label: string;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  placeholder: string;
  queryKey: (search: string) => QueryKey;
  fetch: (search: string, signal: AbortSignal) => Promise<T[]>;
  /** Run the search only when this is true (the firm is known). */
  enabled: boolean;
  getKey: (option: T) => string;
  /** Text read out for an option, and used to describe it. */
  getText: (option: T) => string;
  renderOption: (option: T) => React.ReactNode;
  /** Options that cannot be picked (shown greyed, skipped by the arrow keys). */
  isDisabled?: (option: T) => boolean;
  filter?: (option: T) => boolean;
  onSelect: (option: T) => void;
  emptyText: (search: string) => string;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
};

/**
 * A search box with a list of matches below it (an ARIA combobox).
 * Typing searches the API; Up/Down move through the matches, Enter picks one, Esc closes the list.
 */
export function SearchSelect<T>(props: Props<T>) {
  const {
    id: fixedId,
    label,
    hideLabel,
    placeholder,
    queryKey,
    fetch,
    enabled,
    getKey,
    getText,
    renderOption,
    isDisabled = () => false,
    filter = () => true,
    onSelect,
    emptyText,
    error,
    hint,
    autoFocus,
    inputRef,
    className,
    inputClassName,
  } = props;
  const autoId = useId();
  const id = fixedId ?? autoId;
  const listId = `${id}-list`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Enter picks from the list only once you have typed or used the arrows. The list also opens
  // when Enter lands here from the field before, and a second Enter must move on, not pick.
  const [engaged, setEngaged] = useState(false);
  const search = useDebouncedValue(text.trim(), 250);

  const query = useQuery({
    queryKey: queryKey(search),
    queryFn: ({ signal }) => fetch(search, signal),
    enabled: enabled && open,
    staleTime: 15_000,
  });
  const options = (query.data ?? []).filter(filter);
  const pickable = options.map((o) => !isDisabled(o));
  const activeIndex = pickable[active] ? active : pickable.indexOf(true);

  function move(step: 1 | -1) {
    if (!pickable.includes(true)) return;
    let next = activeIndex;
    do next = (next + step + options.length) % options.length;
    while (!pickable[next]);
    setActive(next);
    document.getElementById(`${id}-opt-${next}`)?.scrollIntoView({ block: "nearest" });
  }

  function pick(option: T) {
    onSelect(option);
    setText("");
    setOpen(false);
    setActive(0);
    setEngaged(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setEngaged(true);
      if (!open) setOpen(true);
      else move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      const option = options[activeIndex];
      // With the list open and a match to pick, Enter picks it; otherwise the form moves on.
      if (open && engaged && option && pickable[activeIndex]) {
        event.preventDefault();
        pick(option);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setEngaged(false);
    }
  }

  const showList = open && enabled;
  const describedBy = [error && `${id}-error`, !error && hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className={cn("mb-2 block text-base font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          ref={inputRef}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && options[activeIndex] ? `${id}-opt-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
            setEngaged(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setEngaged(false);
          }}
          onKeyDown={onKeyDown}
          className={cn(inputCls, "pl-12", inputClassName)}
        />
      </div>

      {showList && (
        <div
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
          // Keep focus in the input while clicking an option.
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul id={listId} role="listbox" aria-label={label}>
            {options.map((option, index) => {
              const disabled = !pickable[index];
              return (
                <li
                  key={getKey(option)}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  aria-disabled={disabled || undefined}
                  aria-label={getText(option)}
                  onMouseEnter={() => !disabled && setActive(index)}
                  onClick={() => !disabled && pick(option)}
                  className={cn(
                    "cursor-pointer border-b border-border px-4 py-3 last:border-b-0",
                    index === activeIndex && "bg-accent",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {renderOption(option)}
                </li>
              );
            })}
          </ul>
          {query.isPending && <p className="px-4 py-3 text-muted-foreground">Searching</p>}
          {query.isError && (
            <p className="px-4 py-3 text-destructive" role="alert">
              {errorMessage(query.error)}
            </p>
          )}
          {query.isSuccess && options.length === 0 && (
            <p className="px-4 py-3 text-muted-foreground">{emptyText(search)}</p>
          )}
        </div>
      )}

      {error ? (
        <p id={`${id}-error`} className="mt-2 font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
