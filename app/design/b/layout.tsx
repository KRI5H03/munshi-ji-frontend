import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { DesignBar } from "@/components/design/design-bar";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = { title: "Munshi Ji — design B" };

export default function LayoutB({ children }: LayoutProps<"/design/b">) {
  return (
    <>
      <DesignBar />
      <div
        className={`${plexSans.variable} ${plexMono.variable} theme-b min-h-[calc(100dvh-2.25rem)] bg-background font-sans text-base text-foreground`}
      >
        {children}
      </div>
    </>
  );
}
