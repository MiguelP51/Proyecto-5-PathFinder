'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PathMentorAvailable from '@/components/PathMentorAvailable';

export default function AvailabilityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) router.push('/login');
        const rol = session?.user?.rol;
        if (rol !== 'MENTOR' && rol !== 'ADMIN') router.push('/');
    }, [session, status, router]);

    if (status === 'loading') return <div className="flex min-h-screen items-center justify-center"><p className="text-slate-500">Cargando...</p></div>;
    if (!session) return null;

    return <PathMentorAvailable />;
}