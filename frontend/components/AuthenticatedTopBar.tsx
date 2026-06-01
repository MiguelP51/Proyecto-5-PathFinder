"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Usuario";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AuthenticatedTopBar() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Usuario conectado";
  const email = session?.user?.email || "";
  const image = session?.user?.image || session?.user?.avatarUrl || "";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo-pf.png"
            alt="PathFinder"
            width={118}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            Sesion activa
          </span>

          <div className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] text-sm font-bold text-white">
                {getInitials(name, email)}
              </div>
            )}

            <div className="hidden min-w-0 pr-2 text-sm md:block">
              <p className="truncate font-semibold text-[#0E3E66]">{name}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#7447D7] hover:text-[#7447D7]"
            aria-label="Cerrar sesion"
            title="Cerrar sesion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
