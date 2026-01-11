import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // 1. Handle the JWT Token
    async jwt({ token, user, trigger, session }) {
      // 💡 THIS IS THE FIX: This detects the update() call from your ProfileForm
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }

      // Initial login
      if (user) {
        token.sub = user.id;
        token.picture = user.image;
      }
      return token;
    },

    // 2. Handle the Session Object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        // 💡 Pass the picture from the token to the session image
        session.user.image = token.picture; 
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

// Helper for Server Components/Actions
export const auth = () => getServerSession(authOptions);

// Bypass Logic (Keep as is)
export async function verifyAuthToken() { 
    console.warn("!!! AUTH BYPASS ACTIVE: Admin access granted automatically. !!!");
    const mockAdminUser = {
        id: 'dev-admin-123',
        email: 'dev@admin.com',
        role: 'admin',
        firstName: 'Dev',
        lastName: 'Admin'
    };
    return { user: mockAdminUser, error: null };
}

export default NextAuth(authOptions);