import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.rol as string | undefined;

    // Mapeo de rutas permitidas por rol
    const roleRoutes: Record<string, RegExp> = {
      user: /^\/user\//,
      mentor: /^\/mentor\//,
      admin: /^\/admin\//,
    };

    // Si no hay rol, rechazar
    if (!userRole) {
      return Response.redirect(new URL("/login", req.url));
    }

    // Verificar si el usuario puede acceder a esta ruta
    const allowedPattern = roleRoutes[userRole.toLowerCase()];
    if (allowedPattern && !allowedPattern.test(pathname)) {
      // Redirigir al home del rol correspondiente
      const homeUrl = `/${userRole.toLowerCase()}/home`;
      return Response.redirect(new URL(homeUrl, req.url));
    }

    return undefined;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitir si hay token (ya autenticado)
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Proteger rutas autenticadas de cada rol
export const config = {
  matcher: [
    "/user/:path*",
    "/mentor/:path*",
    "/admin/:path*",
  ],
};
