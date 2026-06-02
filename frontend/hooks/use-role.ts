/**
 * Hook para acceder al rol del usuario actual
 */
import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/role-utils';

export function useUserRole(): UserRole | undefined {
  const { data: session } = useSession();
  return (session?.user?.rol as UserRole) || undefined;
}

/**
 * Hook para acceder a toda la información del usuario incluyendo el rol
 */
export function useUserInfo() {
  const { data: session } = useSession();
  
  return {
    id: session?.user?.idUsuario,
    name: session?.user?.name,
    email: session?.user?.email,
    rol: (session?.user?.rol as UserRole) || undefined,
    avatar: session?.user?.image || session?.user?.avatarUrl,
    nuevoUsuario: session?.user?.nuevoUsuario,
    requiereCompletarPerfil: session?.user?.requiereCompletarPerfil,
  };
}
