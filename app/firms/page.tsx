import { FirmPicker } from "@/components/auth/firm-picker";

export const metadata = { title: "Choose firm — Munshi Ji" };

export default function FirmsPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:py-20">
      <FirmPicker />
    </main>
  );
}
