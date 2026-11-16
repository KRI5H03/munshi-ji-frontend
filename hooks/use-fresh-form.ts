import { useLayoutEffect, useRef, useState } from "react";

/**
 * Next.js keeps a page you leave mounted but hidden, with what was typed. A draft you walk away
 * from is kept that way. A form that was saved, or whose changes were discarded, must not come back:
 * call `markFinished`, and the form (rendered with `key={formKey}`) is replaced the moment the page is hidden.
 */
export function useFreshForm() {
  const [formKey, setFormKey] = useState(0);
  const finished = useRef(false);

  useLayoutEffect(
    () => () => {
      // Runs when the page is hidden (and on unmount).
      if (finished.current) {
        finished.current = false;
        setFormKey((key) => key + 1);
      }
    },
    [],
  );

  return {
    formKey,
    markFinished: () => {
      finished.current = true;
    },
  };
}
