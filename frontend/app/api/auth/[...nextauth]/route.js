import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
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
        user.avatarUrl = data.avatarUrl;

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
        token.avatarUrl = user.avatarUrl;
        token.googleIdToken = account?.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.idUsuario = token.idUsuario;
      session.user.rol = token.rol;
      session.user.nuevoUsuario = token.nuevoUsuario;
      session.user.avatarUrl = token.avatarUrl;
      session.googleIdToken = token.googleIdToken; // para llamadas al back que requieran JWT
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
