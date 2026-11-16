import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log in — Munshi Ji" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:py-20">
      <LoginForm />
    </main>
  );
}
