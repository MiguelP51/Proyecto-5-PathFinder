'use client';

import { useEffect } from "react";
import { toast } from "sonner";

export default function SessionOpenNotice() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") !== "active") return;

    toast.success("Sesión iniciada correctamente.");
    params.delete("session");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  return null;
}
