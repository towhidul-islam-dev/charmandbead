import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // 🟢 Added
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // 🟢 Added for password verification

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 🟢 ADDED: Credentials Provider for Email/Password Login
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          await dbConnect();
          const user = await User.findOne({ email: email.toLowerCase().trim() });

          if (!user || !user.password) {
            throw new Error("No user found with this email.");
          }

          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) {
            throw new Error("Invalid password.");
          }

          return user;
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Explicitly define JWT strategy
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser && account.provider === "google") {
          // Auto-create user only for Google sign-in
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: SUPER_ADMIN_EMAILS.includes(user.email) ? "admin" : "user",
          });
        }
        return true;
      } catch (error) {
        console.error("SignIn Callback Error:", error);
        return false;
      }
    },

    async jwt({ token, trigger, session, user }) {
      // 🟢 PERFORMANCE FIX: Only query DB on initial sign-in or explicit update
      if (user) {
        token.role = SUPER_ADMIN_EMAILS.includes(user.email) ? "admin" : (user.role || "user");
        token.sub = user._id?.toString() || user.id;
        token.picture = user.image;
        token.name = user.name;
      }

      // Handle real-time updates from client (e.g., Profile Settings)
      if (trigger === "update" && session) {
        if (session.image) token.picture = session.image;
        if (session.name) token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.image = token.picture;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: { 
    signIn: '/login',
    error: '/login', // Redirect auth errors back to login
  },
};

export const auth = () => getServerSession(authOptions);
export default NextAuth(authOptions);

export async function authorizeAdmin(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Authentication required or admin access denied' }, 
      { status: 403 }
    );
  }
  return null; // Authorization successful
}