"use client";

import LoginCard from "@/components/LoginCard";
import styles from "@/styles/LoginRegister.module.css";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const isTimeout = searchParams.get("reason") === "timeout";

    return (
        <div className={styles.container} style={{ flexDirection: "row", gap: "24px", flexWrap: "wrap" }}>
            <LoginCard />
            {isTimeout && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[25px] p-8 shadow-sm flex flex-col justify-center items-center text-center w-[450px] h-[400px] animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 mb-6">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="text-amber-900 dark:text-amber-400 font-bold text-lg mb-3">Sesión Expirada</h2>
                    <p className="text-amber-700 dark:text-amber-500 text-sm leading-relaxed">
                        Tu sesión se ha cerrado automáticamente después de 15 minutos de inactividad para proteger tu información personal y progreso.
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-6 italic">
                        Por favor, vuelve a iniciar sesión con Google para continuar.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Login() {
    return (
        <main>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-slate-500">Cargando...</p></div>}>
                <LoginContent />
            </Suspense>
        </main>
    );
}
