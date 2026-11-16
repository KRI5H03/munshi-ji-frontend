"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/auth/brand";
import { Card, btnOutline, btnPrimary } from "@/components/ui/kit";
import { chooseBusiness, clearSession, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export function FirmPicker() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (!session) {
    return (
      <Card className="p-6 sm:p-8" role="status">
        <Brand />
        <p className="mt-8 text-lg text-muted-foreground">Opening Munshi Ji</p>
      </Card>
    );
  }

  const firms = session.businesses;
  const selected =
    picked ?? session.businessId ?? firms.find((f) => f.isDefault)?.id ?? firms[0]?.id ?? null;

  function logout() {
    clearSession();
    queryClient.clear();
    router.replace("/login");
  }

  function open() {
    if (!selected) return;
    const firm = firms.find((f) => f.id === selected);
    chooseBusiness(selected);
    // Everything cached belongs to the firm that was open before.
    queryClient.clear();
    toast.success(`${firm?.name ?? "Firm"} opened`);
    router.replace("/bills");
  }

  return (
    <Card className="p-6 sm:p-8">
      <Brand />
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Which firm today?</h1>

      {firms.length === 0 ? (
        <p className="mt-6 text-lg">No firm is linked to this login yet. Ask the owner to add you to a firm.</p>
      ) : (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            open();
          }}
        >
          <fieldset className="grid gap-3">
            <legend className="sr-only">Firm</legend>
            {firms.map((firm, index) => (
              <label
                key={firm.id}
                className={cn(
                  "flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-lg border border-input bg-card px-5 py-3 transition-colors duration-150 hover:bg-muted",
                  "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  "has-checked:border-primary has-checked:bg-accent has-checked:outline has-checked:outline-primary",
                )}
              >
                <input
                  type="radio"
                  name="firm"
                  value={firm.id}
                  checked={firm.id === selected}
                  onChange={() => setPicked(firm.id)}
                  autoFocus={firm.id === selected || (!selected && index === 0)}
                  className="peer sr-only"
                />
                <span>
                  <span className="block text-lg font-bold">{firm.name}</span>
                  <span className="block text-muted-foreground capitalize">{firm.role}</span>
                </span>
                <Check className="invisible size-6 text-primary peer-checked:visible" aria-hidden />
              </label>
            ))}
          </fieldset>
          <button type="submit" className={cn(btnPrimary, "mt-6 h-14 w-full text-lg")}>
            Open firm
          </button>
        </form>
      )}

      <button type="button" onClick={logout} className={cn(btnOutline, "mt-3 w-full")}>
        Log out
      </button>
    </Card>
  );
}
