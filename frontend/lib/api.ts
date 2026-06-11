/**
 * lib/api.ts
 * Helper centralizado para llamadas al backend Spring.
 *
 * USO:
 *   import { apiFetch } from "@/lib/api";
 *
 *   // Sin auth (extract CV)
 *   const data = await apiFetch("/api/cv/extract", { method: "POST", body: formData }, null);
 *
 *   // Con auth (guardar CV, obtener CV)
 *   const session = await getSession();
 *   const data = await apiFetch("/api/cv/me", {}, session.backendJwt);
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const isServer = typeof window === "undefined";
  const rawBaseUrl = isServer
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080")
    : (process.env.NEXT_PUBLIC_BACKEND_URL || "");

  let baseUrl = rawBaseUrl;
  if (rawBaseUrl.endsWith("/api") && path.startsWith("/api/")) {
    baseUrl = rawBaseUrl.slice(0, -4);
  } else if (rawBaseUrl.endsWith("/api/") && path.startsWith("/api/")) {
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

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {} // No pongas Content-Type en multipart, el browser lo hace solo
      : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Error ${res.status}`);
  }

  const json = await res.json();
  // El backend envuelve todo en { success, message, data }
  return json.data !== undefined ? json.data : json;
}
