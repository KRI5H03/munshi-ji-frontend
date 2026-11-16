import { Plus } from "lucide-react";
import { GuardedLink } from "@/components/shell/navigation-guard";
import { section } from "@/components/shell/nav";
import { btnPrimary } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/** The section's primary action (New bill, Add customer, Add item) as the filled button on its list page. */
export function PrimaryAction({ sectionHref, className }: { sectionHref: string; className?: string }) {
  const action = section(sectionHref).primaryAction;
  if (!action) return null;
  return (
    <GuardedLink href={action.href} className={cn(btnPrimary, className)}>
      <Plus className="size-5" aria-hidden />
      {action.label}
    </GuardedLink>
  );
}
