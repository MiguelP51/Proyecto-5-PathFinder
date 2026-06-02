import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rol = (session.user as { rol?: string }).rol;
  const requiereCompletarPerfil = (session.user as { requiereCompletarPerfil?: boolean }).requiereCompletarPerfil;

  if (rol === "MENTOR") {
    if (requiereCompletarPerfil) {
      redirect("/profile");
    }
    redirect("/dashboard");
  }

  // USER: si no tiene CV/perfil guardado, va a completar perfil primero
  if (requiereCompletarPerfil) {
    redirect("/user/profile");
  }

  redirect("/?session=active");
}
