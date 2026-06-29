import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MiProgresoClient } from "@/components/progreso/MiProgresoClient";
import { getMiProgreso } from "@/lib/progreso/service";

function getBackendJwt(session: unknown): string | null {
    const typedSession = session as
        | {
        backendJwt?: string;
        accessToken?: string;
        user?: {
            backendJwt?: string;
            accessToken?: string;
        };
    }
        | null
        | undefined;

    return (
        typedSession?.backendJwt ??
        typedSession?.user?.backendJwt ??
        typedSession?.accessToken ??
        typedSession?.user?.accessToken ??
        null
    );
}

export default async function MiProgresoPage() {
    const session = await getServerSession(authOptions);
    const backendJwt = getBackendJwt(session);

    if (!backendJwt) {
        redirect("/");
    }

    try {
        const progreso = await getMiProgreso(backendJwt);

        return <MiProgresoClient progreso={progreso} />;
    } catch (error) {
        console.error("Error cargando Mi Progreso:", error);

        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-lg font-bold text-slate-900">
                    No se pudo cargar tu progreso
                </p>
                <p className="text-sm text-slate-500">
                    Ocurrió un problema al calcular tus puntos o recuperar tus
                    insignias. Intenta recargar la página.
                </p>
            </div>
        );
    }
}
