import { apiFetch } from "@/lib/api";
import {
    StudentPathChallenge,
    StudentPathChallengeFinishRequest,
    StudentPathChallengeProgressRequest,
} from "./student-types";

export async function getStudentPathChallengesBySubarea(
    subareaId: string | number,
    token?: string | null,
): Promise<StudentPathChallenge[]> {
    return apiFetch<StudentPathChallenge[]>(
        `/api/pathchallenges/estudiante?subareaId=${subareaId}`,
        {},
        token,
    );
}

export async function getStudentPathChallengeById(
    pathChallengeId: string | number,
    token?: string | null,
): Promise<StudentPathChallenge> {
    return apiFetch<StudentPathChallenge>(
        `/api/pathchallenges/estudiante/${pathChallengeId}`,
        {},
        token,
    );
}

export async function startStudentPathChallenge(
    pathChallengeId: string | number,
    token?: string | null,
): Promise<StudentPathChallenge> {
    return apiFetch<StudentPathChallenge>(
        `/api/pathchallenges/estudiante/${pathChallengeId}/iniciar`,
        { method: "POST" },
        token,
    );
}

export async function saveStudentPathChallengeProgress(
    pathChallengeId: string | number,
    request: StudentPathChallengeProgressRequest,
    token?: string | null,
): Promise<StudentPathChallenge> {
    return apiFetch<StudentPathChallenge>(
        `/api/pathchallenges/estudiante/${pathChallengeId}/avance`,
        {
            method: "PUT",
            body: JSON.stringify(request),
        },
        token,
    );
}

export async function finishStudentPathChallenge(
    pathChallengeId: string | number,
    request: StudentPathChallengeFinishRequest,
    token?: string | null,
): Promise<StudentPathChallenge> {
    return apiFetch<StudentPathChallenge>(
        `/api/pathchallenges/estudiante/${pathChallengeId}/finalizar`,
        {
            method: "POST",
            body: JSON.stringify(request),
        },
        token,
    );
}

export async function getStartedStudentPathChallenges(
    token?: string | null,
): Promise<StudentPathChallenge[]> {
    return apiFetch<StudentPathChallenge[]>(
        `/api/pathchallenges/estudiante/iniciados`,
        {},
        token,
    );
}

export async function uploadStudentPathChallengeTaskFile(
    pathChallengeId: string | number,
    pathChallengeTaskId: string | number,
    file: File,
    token?: string | null,
): Promise<StudentPathChallenge> {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<StudentPathChallenge>(
        `/api/pathchallenges/estudiante/${pathChallengeId}/tareas/${pathChallengeTaskId}/archivo`,
        {
            method: "POST",
            body: formData,
        },
        token,
    );
}

function buildPathChallengeFileUrl(path: string) {
    const rawBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    let baseUrl = rawBaseUrl.replace(/\/$/, "");

    if (baseUrl.endsWith("/api") && path.startsWith("/api/")) {
        baseUrl = baseUrl.slice(0, -4);
    }

    return `${baseUrl}${path}`;
}

export async function downloadStudentPathChallengeTaskFile(
    pathChallengeId: string | number,
    pathChallengeTaskId: string | number,
    token?: string | null,
): Promise<Blob> {
    const response = await fetch(
        buildPathChallengeFileUrl(
            `/api/pathchallenges/estudiante/${pathChallengeId}/tareas/${pathChallengeTaskId}/archivo/download`,
        ),
        {
            method: "GET",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");

        console.error("Error obteniendo archivo PathChallenge:", {
            status: response.status,
            body: errorText,
        });

        throw new Error("No se pudo abrir o descargar el archivo.");
    }

    return response.blob();
}