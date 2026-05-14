import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    pages: {
    signIn: '/login', // Página de login
    error: '/login', // Redirige a login si hay error
  },
    providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Aquí mandas los datos al backend Java
      try {
        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleUid: account.providerAccountId, // UID de Google
            correo: user.email,
            nombreCompleto: user.name,
            avatarUrl: user.image,
          }),
        });
        return true; // permite el login
      } catch {
        return false; // bloquea el login si el backend falla
      }
    },
    async session({ session }) {
      return session; // session.user tiene email, name, image
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };