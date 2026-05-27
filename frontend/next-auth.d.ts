import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    googleIdToken?: string;
    backendJwt?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      idUsuario?: number;
      rol?: string;
      nuevoUsuario?: boolean;
      requiereCompletarPerfil?: boolean;
      avatarUrl?: string;
    };
  }

  interface User {
    idUsuario?: number;
    rol?: string;
    nuevoUsuario?: boolean;
    requiereCompletarPerfil?: boolean;
    avatarUrl?: string;
    backendJwt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idUsuario?: number;
    rol?: string;
    nuevoUsuario?: boolean;
    requiereCompletarPerfil?: boolean;
    avatarUrl?: string;
    googleIdToken?: string;
    backendJwt?: string;
  }
}
