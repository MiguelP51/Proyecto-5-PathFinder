import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
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
        await fetch(`${process.env.BACKEND_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            nombre: user.name,
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