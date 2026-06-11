'use client';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import SessionTimeoutHandler from "./SessionTimeoutHandler";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionTimeoutHandler>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </SessionTimeoutHandler>
    </SessionProvider>
  );
}