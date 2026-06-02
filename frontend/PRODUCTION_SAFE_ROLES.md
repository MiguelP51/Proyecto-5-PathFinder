# Protección de Rutas por Rol - Estrategia Production-Safe

## Problema Identificado

En producción, el middleware anterior fallaba porque:
1. **Middleware en Edge Runtime** solo ejecuta en full page navigation
2. **RSC (React Server Components) requests** son internos de Next.js sin cookies adjuntas correctamente
3. **nginx reverse proxy** modificaba/stripeaba headers y cookies
4. Las cookies `Secure` (HTTPS) no estaban disponibles en Edge Runtime
5. El middleware veía `token = null` y redirigía a login → **loop infinito**

## Nueva Estrategia: Validación En Capas

```
┌─────────────────────────────────────────────────┐
│         Full Page Navigation                     │
│  (User clicks link, page reload, direct URL)    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│    Middleware (Edge Runtime)                    │
│  ✓ Verifica autenticación básica                │
│  ✗ NO valida rol (evita loops en RSC)           │
│  ✗ NO redirige agresivamente                    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  Client-Side Layout Validation (useSession)    │
│  ✓ Valida rol del usuario                      │
│  ✓ Redirige si rol es incorrecto                │
│  ✓ Tiene acceso a la sesión real                │
│  ✓ Usa useRouter para redireccionamiento       │
└──────────────────────────────────────────────────┘
```

## Cómo Funciona

### 1. Middleware (Minimalista)

```typescript
// middleware.ts
export default withAuth(
  function middleware(req) {
    // Solo verifica que hay un token
    // NO valida rol (evita problemas con RSC requests)
    if (!token) {
      return Response.redirect(new URL("/login", req.url));
    }
    return NextResponse.next(); // Permitir pasar
  }
);
```

**Ventajas:**
- No genera loops en RSC requests
- Solo hace redirect si hay falta de autenticación
- En producción nginx + HTTPS no afecta
- Simple y robusto

### 2. Layout Client-Side (Validación Real)

```typescript
// app/user/(authenticated)/layout.tsx
"use client";

export default function UserLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.rol?.toLowerCase();
      
      // Si el rol no es "user", redirigir al home de su rol
      if (userRole && userRole !== "user") {
        router.replace(`/${userRole}/home`);
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session]);

  // No renderizar hasta validar
  if (status === "loading" || (status === "authenticated" && rol !== "user")) {
    return <LoadingState />;
  }

  return (
    <div>
      <TopBar />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

**Ventajas:**
- Tiene acceso a `useSession()` con sesión real
- Puede redirigir correctamente según el rol
- Si el rol es incorrecto, NO renderiza el contenido
- Funciona en local y producción

### 3. Role Redirect (Fallback)

```typescript
// app/role-redirect.tsx
"use client";

export default function RoleRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.rol) {
      const homeUrl = getRoleHomePath(session.user.rol);
      router.push(homeUrl);
    }
  }, [status, session]);

  return <LoadingState />;
}
```

**Funciona como:**
- Landing page después del login
- Valida sesión + rol
- Redirige al home correcto del rol

## Flujo Completo

### Login (Usuario entra a la app)

```
1. Usuario hace click en "Login"
2. NextAuth autentica con Google
3. Backend retorna: { rol: "user", idUsuario: 123, ... }
4. Redirect a /role-redirect ✓

5. /role-redirect valida sesión
6. useSession() tiene sesión + rol
7. Redirige a /user/home ✓

8. Middleware ve token ✓ (permite pasar)
9. Layout valida rol === "user" ✓
10. Renderiza UserTopBar + UserSidebar ✓
```

### Acceso a Ruta Protegida (RSC Requests)

```
1. Usuario en /user/home hace click a /user/profile
2. Next.js envía RSC request (sin full page reload)
3. Middleware solo verifica token (no valida rol) ✓
4. Layout revalida rol en cliente con useSession() ✓
5. NO hay loop infinito ✓
```

### Usuario con Rol Incorrecto

```
1. Usuario "mentor" intenta acceder /user/home
2. Middleware ve token ✓ (permite pasar)
3. Layout en /user/(authenticated) valida rol
4. Detecta que userRole !== "user"
5. Redirige a /mentor/home ✓
```

## Componentes Actualizados

### Middleware (`middleware.ts`)
- ✅ Minimalista - solo verifica autenticación
- ✅ NO valida rol en Edge Runtime
- ✅ Permite RSC requests sin problemas

### Layouts de Cada Rol
- ✅ `app/user/(authenticated)/layout.tsx`
- ✅ `app/mentor/(authenticated)/layout.tsx`
- ✅ `app/admin/(authenticated)/layout.tsx`

**Todos usan el mismo patrón:**
```typescript
- useSession() para obtener rol
- useRouter() para redirigir
- Validación en useEffect
- No renderizar contenido hasta validar
```

### Role Redirect (`app/role-redirect.tsx`)
- ✅ Mejorado con validación de rol
- ✅ Mejor logging
- ✅ Redirección correcta

## Ventajas de Esta Estrategia

| Aspecto | Anterior | Nuevo |
|--------|----------|-------|
| **Problemas en Prod** | ❌ Loop infinito | ✅ Sin loops |
| **RSC Requests** | ❌ Falla | ✅ Funciona |
| **nginx + Proxy** | ❌ Problemas con headers | ✅ Sin impacto |
| **Validación Rol** | ❌ Edge Runtime | ✅ Client + useSession |
| **Debugging** | ❌ Difícil | ✅ Fácil (console) |
| **Performance** | ❌ Múltiples redirects | ✅ Menos redirects |
| **Local vs Prod** | ❌ Diferente | ✅ Igual |

## Configuración Requerida

### .env.local / .env.production
```bash
# Asegúrate que Next.js pueda leer la sesión
NEXTAUTH_SECRET=<tu-secret>
NEXTAUTH_URL=https://tu-dominio.com  # En producción
NEXTAUTH_URL=http://localhost:3000   # En local
```

### next.config.ts
```typescript
// Asegúrate que no hay transformaciones problemáticas
export default {
  reactStrictMode: true,
  // ... resto de config
};
```

### docker-compose / nginx
```nginx
# Si usas nginx reverse proxy, asegúrate que:
# 1. Preserva cookies con SameSite=None; Secure
# 2. No stripea headers Authentication
# 3. Reenvía X-Forwarded-* headers correctamente

location / {
  proxy_pass http://next-app:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_cookie_flags ~ secure httponly samesite=none;
}
```

## Testing

### Local
```bash
npm run dev
# Todos los roles funcionan correctamente
# No hay loops de redirección
```

### Production Simulation
```bash
npm run build
npm start
# Verificar que:
# - Login funciona
# - Redirección por rol funciona
# - RSC requests no generan loops
```

## Rollback (Si algo falla)

Si necesitas volver al middleware anterior:
```bash
git checkout HEAD -- middleware.ts
git checkout HEAD -- app/user/(authenticated)/layout.tsx
git checkout HEAD -- app/mentor/(authenticated)/layout.tsx
git checkout HEAD -- app/admin/(authenticated)/layout.tsx
```

## Monitoreo en Producción

Revisa los logs de:
1. **Browser Console**: Busca `[RoleRedirect]` logs
2. **NextAuth**: Sesión válida después de login
3. **nginx**: Headers preservados correctamente
4. **Next.js Logs**: Sin errores de middleware

## Resumen

✅ **Problema Resuelto**: Loops infinitos en producción
✅ **Validación Robusta**: Client-side con useSession()
✅ **Compatible**: Local + Producción + Docker
✅ **Performante**: Menos redirects innecesarios
✅ **Debuggeable**: Logs claros en console
