"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SubAreasPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la pantalla unificada de áreas
    router.replace("/admin/areas");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500 font-medium">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      <p className="text-sm">Redireccionando a la administración unificada de áreas y subáreas...</p>
    </div>
  );
}
