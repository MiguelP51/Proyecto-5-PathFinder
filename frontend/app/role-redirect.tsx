'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getRoleHomePath } from '@/lib/role-utils';

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.rol) {
      const userRole = session.user.rol.toLowerCase();
      console.log('[RoleRedirect] Usuario con rol:', userRole);
      const homeUrl = getRoleHomePath(userRole);
      console.log('[RoleRedirect] Redirigiendo a:', homeUrl);
      router.push(homeUrl);
    }
  }, [status, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0E3E66]">Redirigiendo...</h1>
        <p className="text-slate-600 mt-2">Un momento mientras te llevamos a tu destino.</p>
      </div>
    </div>
  );
}
