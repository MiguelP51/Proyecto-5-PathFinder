import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Si no tiene CV/perfil guardado, va a completar perfil primero
  const requiereCompletarPerfil = (session.user as { requiereCompletarPerfil?: boolean }).requiereCompletarPerfil;
  if (requiereCompletarPerfil) {
    redirect("/usuario/profile");
  }

  redirect("/?session=active");
}
