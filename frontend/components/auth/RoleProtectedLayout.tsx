/**
 * Componente wrapper para proteger rutas según el rol
 * Se valida en el servidor para ser más robusto
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RoleProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
  defaultRedirect?: string;
}

export async function validateUserRole(
  allowedRoles: string[],
  defaultRedirect = "/login"
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(defaultRedirect);
  }

  const userRole = session.user?.rol as string | undefined;

  if (!userRole || !allowedRoles.includes(userRole.toLowerCase())) {
    // Redirigir al home del rol o a login
    const fallbackUrl = userRole
      ? `/${userRole.toLowerCase()}/home`
      : defaultRedirect;
    redirect(fallbackUrl);
  }

  return { session, userRole };
}

/**
 * Componente para proteger rutas en el layout
 */
export default async function RoleProtectedLayout({
  children,
  allowedRoles,
}: RoleProtectedLayoutProps) {
  await validateUserRole(allowedRoles);
  return <>{children}</>;
}
