"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { me } from "@/lib/api/auth";
import { keys } from "@/lib/query";
import { useSession } from "@/lib/session";

/**
 * Lets the app render only with a login and an open firm.
 * No login -> /login. Login but no firm -> /firms. The API client clears the
 * session on a 401 and the firm on BUSINESS_REQUIRED, which lands here too.
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

  if (!loggedIn || !hasFirm) {
    return (
      <div role="status" className="grid min-h-dvh place-items-center bg-background text-lg text-muted-foreground">
        Opening Munshi Ji
      </div>
    );
  }
  return children;
}
