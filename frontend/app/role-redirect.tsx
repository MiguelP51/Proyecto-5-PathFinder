'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getRoleHomePath } from '@/lib/role-utils';

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si estamos autenticados y tenemos un rol
    if (status === 'authenticated' && session?.user?.rol) {
      const userRole = session.user.rol.toLowerCase();

      console.log('[RoleRedirect] Usuario con rol:', userRole);
      
      // Validar que el rol sea válido
      const validRoles = ['user', 'mentor', 'admin'];
      if (!validRoles.includes(userRole)) {
        console.warn('[RoleRedirect] Rol inválido:', userRole);
        router.push('/login');
        return;
      }

      const homeUrl = getRoleHomePath(userRole);

      console.log('[RoleRedirect] Redirigiendo a:', homeUrl);
      router.push(homeUrl);
    } else if (status === 'unauthenticated') {
      // Sin sesión, ir a login
      console.log('[RoleRedirect] Sin sesión, ir a login');
      router.push('/login');
    }
    // Si status === 'loading', esperar a que cargue
  }, [status, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-8">
        {/* Spinner animado */}
        <div className="relative h-20 w-20">
          {/* Anillo exterior */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-transparent border-t-[#7447D7]" />
          
          {/* Anillo interior más lento */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#1E3A8A]"
            style={{
              animation: 'spin 3s linear infinite reverse',
            }}
          />
          
          {/* Centro decorativo */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#7447D7] to-[#1E3A8A]" />
        </div>

        {/* Texto */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7447D7] to-[#1E3A8A] bg-clip-text text-transparent">
            Redirigiendo...
          </h1>
          <p className="mt-3 text-slate-600">
            Validando tu sesión y rol
          </p>
        </div>

        {/* Puntos animados */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-[#7447D7]"
              style={{
                animation: `pulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

