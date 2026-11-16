import { ArrowLeft } from "lucide-react";
import { GuardedLink } from "@/components/shell/navigation-guard";

/** "← Back" above the title of a create or edit page. Goes to the section's list. */
export function BackLink({ href, to }: { href: string; to: string }) {
  return (
    <GuardedLink
      href={href}
      aria-label={`Back to ${to}`}
      className="-ml-2 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-lg font-medium text-accent-foreground outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowLeft className="size-5" aria-hidden />
      Back
    </GuardedLink>
  );
}
