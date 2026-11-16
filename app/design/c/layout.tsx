import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import { DesignBar } from "@/components/design/design-bar";

const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"] });
const atkinsonMono = Atkinson_Hyperlegible_Mono({ variable: "--font-atkinson-mono", subsets: ["latin"] });

export const metadata = { title: "Munshi Ji — design C" };

export default function LayoutC({ children }: LayoutProps<"/design/c">) {
  return (
    <>
      <DesignBar />
      <div
        className={`${atkinson.variable} ${atkinsonMono.variable} theme-c min-h-[calc(100dvh-2.25rem)] bg-background font-sans text-lg text-foreground`}
      >
        {children}
      </div>
    </>
  );
}
