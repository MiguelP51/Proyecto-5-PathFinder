"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import styles from "../../styles/PathMentorTopbar.module.css";

interface Props {
  onMenuClick: () => void;
}

export default function MentorTopBar({ onMenuClick }: Props) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name = session?.user?.name || "Mentor";
  const userImage = session?.user?.image || session?.user?.avatarUrl || "";

  return (
    <header className={styles.topbar}>
      {/* LEFT SECTION: Burger + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* LOGO */}
        <Link href="/mentor/home">
          <Image
            src="/assets/logo-pf.png"
            alt="PathFinder"
            width={118}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* RIGHT SECTION: Notification + Profile */}
      <div className={styles.rightSection}>
        {/* THEME TOGGLE */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 px-3 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer mr-3 gap-1.5"
            aria-label="Alternar modo oscuro"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                <span className="text-xs font-semibold">Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span className="text-xs font-semibold">Modo oscuro</span>
              </>
            )}
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Card */}
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {userImage ? (
              <img
                src={userImage}
                alt={name}
                className={styles.avatarImg}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7447D7] to-[#D43EE6] flex items-center justify-center text-white text-base font-bold border-2 border-slate-200">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={styles.userText}>
            <h3>{name}</h3>
            <p>PathMentor</p>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={() =>
            signOut({
              callbackUrl: "/",
            })
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition hover:border-[#7447D7] hover:text-[#7447D7] dark:hover:border-purple-400 dark:hover:text-purple-400 cursor-pointer"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
