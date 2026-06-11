import { SkillPath, SkillPathFilters } from "./types";

interface BackendApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

function getSkillPathBackendUrl() {
    const isServer = typeof window === "undefined";

    if (isServer) {
        return process.env.SKILLPATH_BACKEND_URL || process.env.BACKEND_URL || "http://backend:8080";
    }

    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
}

async function skillPathFetch<T>(
    path: string,
    token?: string | null,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${getSkillPathBackendUrl()}${path}`, {
        ...options,
        headers: {
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            ...(options.headers as Record<string, string>),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error consumiendo SkillPath API:", {
            status: response.status,
            body: errorText,
        });

        throw new Error(`Error ${response.status} al consumir SkillPath API`);
    }

    if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("La respuesta no es JSON:", text);
        throw new Error("La respuesta del backend no es JSON");
    }

    const json = await response.json();

    return json.data;
}

export async function getSkillPaths(
    filters?: SkillPathFilters,
    token?: string | null,
): Promise<SkillPath[]> {
    const params = new URLSearchParams();

    if (filters?.subareaId) {
        params.set("subareaId", filters.subareaId);
    }

    const queryString = params.toString();

    const path = queryString
        ? `/api/skillpaths/estudiante?${queryString}`
        : "/api/skillpaths/estudiante";

    return skillPathFetch<SkillPath[]>(path, token);
}

export async function getStartedSkillPaths(
    token?: string | null,
): Promise<SkillPath[]> {
    return skillPathFetch<SkillPath[]>(
        "/api/skillpaths/estudiante/iniciados",
        token,
    );
}

export async function getSkillPathById(
    skillPathId: string,
    token?: string | null,
): Promise<SkillPath | null> {
    try {
        return await skillPathFetch<SkillPath>(
            `/api/skillpaths/estudiante/${skillPathId}`,
            token,
        );
    } catch (error) {
        console.error("Error obteniendo SkillPath:", error);
        return null;
    }
}

export async function startSkillPath(
    skillPathId: string,
    token?: string | null,
): Promise<SkillPath> {
    return skillPathFetch<SkillPath>(
        `/api/skillpaths/estudiante/${skillPathId}/iniciar`,
        token,
        {
            method: "POST",
        },
    );
}

export async function uploadSkillPathEvidence(
    skillPathId: string,
    file: File,
    token?: string | null,
): Promise<SkillPath> {
    const formData = new FormData();
    formData.append("file", file);

    return skillPathFetch<SkillPath>(
        `/api/skillpaths/estudiante/${skillPathId}/evidencia`,
        token,
        {
            method: "POST",
            body: formData,
        },
    );
}

export async function deleteSkillPathEvidence(
    skillPathId: string,
    token?: string | null,
): Promise<SkillPath> {
    return skillPathFetch<SkillPath>(
        `/api/skillpaths/estudiante/${skillPathId}/evidencia`,
        token,
        {
            method: "DELETE",
        },
    );
}

export async function downloadSkillPathEvidence(
    skillPathId: string,
    token?: string | null,
): Promise<Blob> {
    const response = await fetch(
        `${getSkillPathBackendUrl()}/api/skillpaths/estudiante/${skillPathId}/evidencia/download`,
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
        console.error("Error obteniendo evidencia SkillPath:", {
            status: response.status,
            body: errorText,
        });

        throw new Error("No se pudo abrir la evidencia subida.");
    }

    return response.blob();
}
