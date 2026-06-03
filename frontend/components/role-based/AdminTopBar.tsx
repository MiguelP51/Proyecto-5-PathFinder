"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface Props {
  onMenuClick: () => void;
}

function getInitials(
  name?: string | null,
  email?: string | null
) {
  const source =
    name?.trim() ||
    email?.split("@")[0] ||
    "Admin";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminTopBar({
  onMenuClick,
}: Props) {
  const { data: session } = useSession();

  const name =
    session?.user?.name ||
    "Admin conectado";

  const email =
    session?.user?.email || "";

  const image =
    session?.user?.image ||
    session?.user?.avatarUrl ||
    "";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur h-16">

      <div className="flex h-16 items-center justify-between px-4 md:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* MENU BUTTON */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0E3E66] hover:text-[#0E3E66]"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* PAGE TITLE */}
          <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 md:px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#2D1B4E] to-[#6B46C1] text-white text-xs font-semibold">
                    {getInitials(name, email)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Administrador
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/audit" className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Auditoría
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  signOut({
                    callbackUrl: "/",
                  })
                }
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
