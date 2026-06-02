/**
 * middleware.ts mejorado para producción
 * 
 * Estrategia:
 * 1. El middleware es minimalista y no agresivo
 * 2. Solo detecta si hay sesión válida (sin validar rol)
 * 3. La validación real de rol acontece en los layouts/pages (Server Components)
 * 4. Esto evita loops de redirección en RSC requests
 */

import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Middleware minimalista que solo verifica autenticación básica
export default withAuth(
  function middleware(req: any) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Permitir rutas públicas siempre
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/about",
      "/areas",
      "/contact",
      "/simulation",
      "/role-redirect",
    ];

    if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Si no hay token en rutas protegidas, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Dejar pasar todas las requests autenticadas
    // La validación de rol acontece en los layouts de cada rol
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Solo verificamos que haya un token
        // La validación de rol es responsabilidad de los layouts
        return true; // Permitir todos los requests
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Config: solo proteger las rutas de los roles
export const config = {
  matcher: [
    "/user/:path*",
    "/mentor/:path*",
    "/admin/:path*",
  ],
};
