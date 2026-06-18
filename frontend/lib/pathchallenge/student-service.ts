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