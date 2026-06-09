"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white font-bold text-base shadow-sm">P</div>
          <span className="font-extrabold tracking-wider text-slate-800 dark:text-slate-100 text-sm">
            PATH<span className="text-blue-500">MENTOR</span>
          </span>
        </div>
      </div>

      {/* RIGHT SECTION: Notification + Profile */}
      <div className={styles.rightSection}>
        {/* THEME TOGGLE */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400 cursor-pointer mr-3"
            aria-label="Alternar modo oscuro"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        {/* Notification Bell */}
        <div className={styles.notification}>
          🔔
          <span className={styles.badge}>3</span>
        </div>

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
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-base font-bold border-2 border-slate-200">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 cursor-pointer"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
