import { signOut } from "next-auth/react";

export async function handleSecureLogout(backendJwt?: string | null) {
  try {
    if (backendJwt) {
      const isServer = typeof window === "undefined";
      const rawBaseUrl = isServer
        ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080")
        : (process.env.NEXT_PUBLIC_BACKEND_URL || "");

      let baseUrl = rawBaseUrl;
      if (rawBaseUrl.endsWith("/api")) {
        baseUrl = rawBaseUrl.slice(0, -4);
      } else if (rawBaseUrl.endsWith("/api/")) {
        baseUrl = rawBaseUrl.slice(0, -5);
      }

      // Align protocol with current window location to prevent HTTP/HTTPS mismatch
      if (!isServer && typeof window !== "undefined" && baseUrl.startsWith("http")) {
        const currentProtocol = window.location.protocol; // "http:" or "https:"
        if (baseUrl.startsWith("http:") && currentProtocol === "https:") {
          baseUrl = baseUrl.replace(/^http:/, "https:");
        } else if (baseUrl.startsWith("https:") && currentProtocol === "http:") {
          baseUrl = baseUrl.replace(/^https:/, "http:");
        }
      }

      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${backendJwt}`,
          "Content-Type": "application/json"
        }
      }).catch(err => console.error("Error calling backend logout endpoint:", err));
    }
  } catch (error) {
    console.error("Secure logout backend sync failed:", error);
  } finally {
    // Force clean local storage and session storage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        
        // Clear all cookies manually for extra safety
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }
    } catch (e) {
      console.error("Error clearing browser state manually:", e);
    }
    // Call standard NextAuth signOut
    signOut({ callbackUrl: "/" });
  }
}
