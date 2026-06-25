import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PathChallengeMissionClient } from "@/components/pathchallenge/PathChallengeMissionClient";
import { getStudentPathChallengeById } from "@/lib/pathchallenge/student-service";

interface ChallengeMissionPageProps {
    params: Promise<{
        idPathChallenge: string;
    }>;
    searchParams: Promise<{
        returnTo?: string;
        returnLabel?: string;
    }>;
}

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

export default async function ChallengeMissionPage({
                                                       params,
                                                       searchParams,
                                                   }: ChallengeMissionPageProps) {
    const { idPathChallenge } = await params;
    const resolvedSearchParams = await searchParams;

    const session = await getServerSession(authOptions);
    const backendJwt = getBackendJwt(session);

    if (!backendJwt) {
        redirect("/");
    }

    const safeReturnTo =
        resolvedSearchParams.returnTo?.startsWith("/")
            ? resolvedSearchParams.returnTo
            : `/user/app/challenges/${idPathChallenge}`;

    const returnLabel =
        resolvedSearchParams.returnLabel ?? "Volver al briefing";

    try {
        const challenge = await getStudentPathChallengeById(
            idPathChallenge,
            backendJwt,
        );

        return (
            <PathChallengeMissionClient
                challenge={challenge}
                backHref={safeReturnTo}
                backLabel={returnLabel}
            />
        );
    } catch (error) {
        console.error("Error cargando realización de PathChallenge:", error);
        notFound();
    }
}