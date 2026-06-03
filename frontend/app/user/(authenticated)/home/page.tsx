import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Verificar en tiempo real con el backend si ya tiene perfil creado (por ejemplo, si omitió o guardó borrador)
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/users/me/status`, {
      headers: {
        Authorization: `Bearer ${(session as any).backendJwt}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      const statusData = json.data || json;
      if (statusData && statusData.tienePerfilCV) {
        redirect("/?session=active");
      }
    }
  } catch (err) {
    console.error("Error verificando estado del perfil en tiempo real:", err);
  }

  // Fallback al estado de la sesión
  const requiereCompletarPerfil = (session.user as { requiereCompletarPerfil?: boolean }).requiereCompletarPerfil;
  if (requiereCompletarPerfil) {
    redirect("/user/profile");
  }

  redirect("/?session=active");
}
