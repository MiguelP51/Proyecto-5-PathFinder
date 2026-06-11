"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Play } from "lucide-react";
import { useState } from "react";

import { SkillPath } from "@/lib/skillpath/types";
import { startSkillPath } from "@/lib/skillpath/service";

interface SkillPathActionButtonProps {
    skillPath: SkillPath;
    className?: string;
    labelOverride?: string;
}

async function getBackendJwtFromSession() {
    const response = await fetch("/api/auth/session");
    const session = await response.json();

    if (!session.backendJwt) {
        throw new Error("No se encontró backendJwt en la sesión");
    }

    return session.backendJwt as string;
}

function getButtonLabel(skillPath: SkillPath) {
    switch (skillPath.status) {
        case "DISPONIBLE":
            return "Iniciar SkillPath";
        case "EN_PROGRESO":
            return "Continuar SkillPath";
        case "CERTIFICADO_PENDIENTE":
            return "Subir certificado";
        case "VALIDACION_PENDIENTE":
            return "Ver validación";
        case "VALIDADO":
        case "COMPLETADO":
            return "Ver SkillPath";
        case "RECHAZADO":
            return "Reenviar evidencia";
        default:
            return "Ver SkillPath";
    }
}

export function SkillPathActionButton({
                                          skillPath,
                                          className,
                                          labelOverride,
                                      }: SkillPathActionButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const label = labelOverride ?? getButtonLabel(skillPath);

    const handleClick = async () => {
        try {
            setIsLoading(true);

            if (skillPath.status === "DISPONIBLE") {
                const token = await getBackendJwtFromSession();

                await startSkillPath(skillPath.id, token);

                router.push(`/user/app/skillpaths/${skillPath.id}`);
                router.refresh();
                return;
            }

            router.push(`/user/app/skillpaths/${skillPath.id}`);
        } catch (error) {
            console.error("Error ejecutando acción de SkillPath:", error);
            alert("No se pudo ejecutar la acción del SkillPath. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoading}
            className={
                className ??
                "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7447D7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6036c2] disabled:cursor-not-allowed disabled:opacity-60"
            }
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                </>
            ) : (
                <>
                    <Play className="h-4 w-4" />
                    {label}
                    <ArrowRight className="h-4 w-4" />
                </>
            )}
        </button>
    );
}