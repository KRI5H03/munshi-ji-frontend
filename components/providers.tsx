"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // A fresh client per server render; one shared client in the browser.
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <Toaster
        position="top-center"
        duration={4000}
        toastOptions={{
          classNames: {
            toast: "!text-base !font-medium !rounded-xl !border-border !shadow-md",
            error: "!text-destructive",
          },
        }}
      />
    </QueryClientProvider>
  );
}
