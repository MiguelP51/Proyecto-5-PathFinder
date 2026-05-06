import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '600', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "Path Finder",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Path Finder</title>
      </head>
      <body>
        <Navbar />
        <main style={{ marginTop: '80px' }}>{children}</main>
      </body>
    </html>
  );
}