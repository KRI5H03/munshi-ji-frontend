"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/lib/api/auth";
import { keys } from "@/lib/query";
import { useSession } from "@/lib/session";

/**
 * Sends you to /login without a login and to /firms without an open firm.
 * The API client clears the session on a 401 and the firm on BUSINESS_REQUIRED, which lands here too.
 *
 * The page itself always renders, so it appears at once with placeholders; firm data
 * waits for the firm id (see useFirmId), so nothing is fetched before the login is known.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const loggedIn = Boolean(session);
  const hasFirm = Boolean(session?.businessId);

  // On app start, ask the server whether the stored token is still good.
  useQuery({
    queryKey: keys.me,
    queryFn: ({ signal }) => me(signal),
    enabled: loggedIn,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (session === undefined) return;
    if (!loggedIn) router.replace("/login");
    else if (!hasFirm) router.replace("/firms");
  }, [session, loggedIn, hasFirm, router]);

  return children;
}
