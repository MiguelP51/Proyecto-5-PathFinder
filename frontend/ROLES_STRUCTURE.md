# Estructura de Roles - PathFinder

## Resumen de Cambios

Se ha implementado una estructura completa de soporte para 3 roles de usuario:
- **Usuario**: Acceso normal a la plataforma
- **Mentor**: Mentor de carreras profesionales
- **Admin**: Administrador del sistema

## Estructura de Carpetas

```
app/
├── (auth)/                    # Páginas públicas
│   ├── login/
│   ├── register/
│   ├── about/
│   ├── areas/
│   ├── simulation/
│   ├── contact/
│   ├── role-redirect/         # NEW: Redireccionamiento por rol
│   └── layout.tsx
├── user/                      # Rutas del Usuario Normal
│   └── (authenticated)/
│       ├── home/
│       ├── profile/
│       ├── app/
│       │   ├── simulation-intro/
│       │   └── disc-intro/
│       └── layout.tsx
├── mentor/                   # NEW: Rutas del Mentor
│   └── (authenticated)/
│       ├── home/
│       ├── students/           # Placeholder
│       ├── guidance/           # Placeholder
│       ├── analytics/          # Placeholder
│       └── layout.tsx
├── admin/                      # NEW: Rutas del Administrador
│   └── (authenticated)/
│       ├── home/
│       ├── users/              # Placeholder
│       ├── mentors/            # Placeholder
│       ├── settings/           # Placeholder
│       └── layout.tsx
├── layout.tsx
├── role-redirect.tsx           # NEW: Componente de redireccionamiento
└── api/
    └── auth/[...nextauth]/route.js

components/
├── role-based/                 # NEW: Componentes específicos por rol
│   ├── UserTopBar.tsx
│   ├── UserSidebar.tsx
│   ├── MentorTopBar.tsx
│   ├── MentorSidebar.tsx
│   ├── AdminTopBar.tsx
│   └── AdminSidebar.tsx
└── ... otros componentes

lib/
├── api.ts
├── utils.ts
└── role-utils.ts              # NEW: Utilidades para manejo de roles

hooks/
├── use-mobile.ts
├── use-toast.ts
└── use-role.ts                 # NEW: Hook para acceder al rol

middleware.ts                   # NEW: Validación de roles y rutas
```

## Flujo de Autenticación

1. **Login**: Usuario inicia sesión con Google
2. **Backend**: 
   - Backend retorna campo `rol` ("user", "mentor", o "admin")
   - Se guarda en el JWT y en la sesión de NextAuth
3. **Redireccionamiento**: 
   - Se redirige a `/role-redirect`
   - El componente `RoleRedirect` valida el rol y redirige a:
     - `/user/home` para usuario
     - `/mentor/home` para mentor
     - `/admin/home` para admin
4. **Middleware**: 
   - Valida que el usuario tenga acceso a la ruta según su rol
   - Redirige a la ruta correcta si intenta acceder a otra

## Componentes de Navegación

### Por Rol

| Rol | TopBar | Sidebar | Color |
|-----|--------|---------|-------|
| Usuario | `UserTopBar` | `UserSidebar` | Púrpura (#7447D7) |
| Mentor | `MentorTopBar` | `MentorSidebar` | Azul |
| Admin | `AdminTopBar` | `AdminSidebar` | Rojo |

Cada navbar tiene:
- Logo personalizado
- Estado de sesión con color de rol
- Avatar del usuario
- Menú de navegación específico del rol
- Botón de logout

## Hooks Personalizados

### `useUserRole()`
```typescript
import { useUserRole } from '@/hooks/use-role';

const rol = useUserRole(); // "user" | "mentor" | "admin"
```

### `useUserInfo()`
```typescript
import { useUserInfo } from '@/hooks/use-role';

const userInfo = useUserInfo();
// {
//   id: number,
//   name: string,
//   email: string,
//   rol: "user" | "mentor" | "admin",
//   avatar: string,
//   nuevoUsuario: boolean,
//   requiereCompletarPerfil: boolean
// }
```

## Utilidades (`lib/role-utils.ts`)

```typescript
import {
  getRoleBasePath,      // "/user", "/mentor", "/admin"
  getRoleHomePath,      // "/user/home", etc.
  getRoleDisplayName,   // "Usuario", "Mentor", "Administrador"
  isValidRole,          // Valida si el rol es válido
  UserRole              // Tipo: "user" | "mentor" | "admin"
} from '@/lib/role-utils';
```

## NextAuth Configuración

El archivo `app/api/auth/[...nextauth]/route.js` ya está configurado para:
1. Enviar los datos al backend con `/api/auth/login`
2. Recibir el campo `rol` en la respuesta
3. Guardar el `rol` en el JWT y la sesión
4. Redirigir a `/role-redirect` después del login

### Validación en el Backend

El backend debe retornar en `/api/auth/login`:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "idUsuario": 1,
    "correo": "user@example.com",
    "nombreCompleto": "Juan Pérez",
    "avatarUrl": "https://...",
    "rol": "user",           // IMPORTANTE: Campo necesario. Valores: "user", "mentor", "admin"
    "nuevoUsuario": false,
    "requiereCompletarPerfil": false,
    "backendJwt": "eyJ0eXAi..."
  }
}
```

## Rutas Protegidas

El middleware protege:
- `/user/*` - Solo accesibles si `rol == "user"`
- `/mentor/*` - Solo accesibles si `rol == "mentor"`
- `/admin/*` - Solo accesibles si `rol == "admin"`

Si un usuario intenta acceder a una ruta que no le corresponde, será redirigido al home de su rol.

## Próximos Pasos

1. **Crear páginas específicas para cada rol**:
   - Mentor: `/mentor/(authenticated)/students`
   - Admin: `/admin/(authenticated)/users`, `/admin/(authenticated)/settings`

2. **Agregar lógica de negocio específica por rol** en cada página

3. **Validar permisos granulares** si es necesario (ej: solo mentores con cierto nivel pueden hacer X)

4. **Agregar auditoría** de acciones por rol

## TypeScript

Las definiciones de tipos para session ya incluyen:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      rol?: string;           // "user" | "mentor" | "admin"
      idUsuario?: number;
      nuevoUsuario?: boolean;
      requiereCompletarPerfil?: boolean;
      avatarUrl?: string;
      // ... otros campos
    };
  }
}
```

Usa el tipo `UserRole` del archivo `lib/role-utils.ts` para type-safety en tus componentes.
