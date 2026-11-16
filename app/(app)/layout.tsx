import { AuthGate } from "@/components/auth/auth-gate";
import { AppShell } from "@/components/shell/app-shell";
import { NavigationGuardProvider } from "@/components/shell/navigation-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <NavigationGuardProvider>
        <AppShell>{children}</AppShell>
      </NavigationGuardProvider>
    </AuthGate>
  );
}
