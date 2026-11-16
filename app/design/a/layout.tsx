import { DesignBar } from "@/components/design/design-bar";

export const metadata = { title: "Munshi Ji — design A" };

export default function LayoutA({ children }: LayoutProps<"/design/a">) {
  return (
    <>
      <DesignBar />
      <div className="theme-a min-h-[calc(100dvh-2.25rem)] bg-background font-sans text-base text-foreground">
        {children}
      </div>
    </>
  );
}
