import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rol = (session.user as { rol?: string }).rol;

  if (rol === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (rol === "MENTOR") {
    redirect("/mentor/dashboard");
  }

  // Estudiante (USER) — si es nuevo, va a completar perfil primero
  const nuevoUsuario = (session.user as { nuevoUsuario?: boolean }).nuevoUsuario;
  if (nuevoUsuario) {
    redirect("/profile");
  }

  redirect("/student/dashboard");
}
