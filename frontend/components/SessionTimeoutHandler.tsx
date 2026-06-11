'use client';

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { handleSecureLogout } from "@/lib/auth-utils";

const TIMEOUT_IN_MS = 15 * 60 * 1000; // 15 minutes

export default function SessionTimeoutHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if the user is authenticated
    if (status !== "authenticated") {
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        console.log("[SessionTimeoutHandler] User inactive for 15 minutes, performing secure logout...");
        const jwt = session?.backendJwt;
        await handleSecureLogout(jwt);
        // Redirect to login with reason=timeout query param
        router.push("/login?reason=timeout");
      }, TIMEOUT_IN_MS);
    };

    // Events to monitor for activity
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    // Initialize timer on mount or session change
    resetTimer();

    // Attach listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Clean up
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status, session, router]);

  return <>{children}</>;
}
