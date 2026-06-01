"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "U";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: session } = useSession();

  const name = session?.user?.name || "";
  const email = session?.user?.email || "";
  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

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

          {!session ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-3 rounded-full border border-slate-200 px-2 py-1 shadow-sm">

                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-sm font-bold text-white">
                    {getInitials(name, email)}
                  </div>
                )}

                <div className="max-w-[160px] overflow-hidden">
                  <p className="truncate text-sm font-semibold text-[#0E3E66]">
                    {name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {email}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#7447D7] hover:text-[#7447D7]"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          )}

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

            {!session ? (
              <>
                <Link href="/login">
                  Iniciar sesión
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#A855F7] px-5 py-3 text-center font-semibold text-white"
                >
                  Empieza ahora
                </Link>
              </>
            ) : (
              <>

                <div className="flex items-center gap-3">

                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-sm font-bold text-white">
                      {getInitials(name, email)}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">
                      {name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {email}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>

              </>
            )}

          </nav>
        </div>
      )}
    </header>
  );
}