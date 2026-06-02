import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false }
    },
    state: {
      name: `next-auth.state`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false }
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Llama al backend con los datos de Google
        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: user.email,
            nombreCompleto: user.name,
            avatarUrl: user.image,
          }),
        });

        if (!res.ok) return false;

        const json = await res.json(); // { success, message, data: { idUsuario, correo, ... } }
        const data = json.data;

        // Guardamos los datos del usuario para usarlos en jwt()
        user.idUsuario = data.idUsuario;
        user.rol = data.rol;
        user.nuevoUsuario = data.nuevoUsuario;
        user.requiereCompletarPerfil = data.requiereCompletarPerfil;
        user.avatarUrl = data.avatarUrl;
        user.backendJwt = data.backendJwt;

        return true;
      } catch (err) {
        console.error("Error en signIn callback:", err);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Primer login: guardamos el id_token de Google para generar JWT del back
        // y los datos del usuario
        token.idUsuario = user.idUsuario;
        token.rol = user.rol;
        token.nuevoUsuario = user.nuevoUsuario;
        token.requiereCompletarPerfil = user.requiereCompletarPerfil;
        token.avatarUrl = user.avatarUrl;
        token.backendJwt = user.backendJwt;
        token.googleIdToken = account?.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.idUsuario = token.idUsuario;
      session.user.rol = token.rol;
      session.user.nuevoUsuario = token.nuevoUsuario;
      session.user.requiereCompletarPerfil = token.requiereCompletarPerfil;
      session.user.avatarUrl = token.avatarUrl;
      session.backendJwt = token.backendJwt;
      session.googleIdToken = token.googleIdToken;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/home`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
