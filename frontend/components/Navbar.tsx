"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/assets/logo-pf.png"
            alt="PathFinder"
            width={120}
            height={40}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link href="/">Inicio</Link>

          <Link href="/areas">
            Áreas
          </Link>

          <Link href="/about">
            Sobre nosotros
          </Link>

          <Link href="/contact">
            Contacto
          </Link>

          <Link href="/simulation">
            Simulación
          </Link>

          <Link
            href="/login"
            className="font-medium"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] px-5 py-3 font-semibold text-white"
          >
            Empieza ahora
          </Link>

        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <Menu className="h-8 w-8" />
          )}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">

          <nav className="flex flex-col gap-6 p-6 text-lg">

            <Link href="/">
              Inicio
            </Link>

            <Link href="/areas">
              Áreas
            </Link>

            <Link href="/about">
              Sobre nosotros
            </Link>

            <Link href="/contact">
              Contacto
            </Link>

            <Link href="/simulation">
              Simulación
            </Link>

            <Link href="/login">
              Iniciar sesión
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] px-5 py-3 text-center font-semibold text-white"
            >
              Empieza ahora
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}