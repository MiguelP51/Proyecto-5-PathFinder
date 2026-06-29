import { apiFetch } from "@/lib/api";
import { MiProgreso } from "@/lib/progreso/types";

export async function getMiProgreso(
    token?: string | null,
): Promise<MiProgreso> {
    return apiFetch<MiProgreso>(
        `/api/mi-progreso`,
        {},
        token,
    );
}
