import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: SUPER_ADMIN_EMAILS.includes(user.email) ? "admin" : "user", 
          });
        }
        return true;
      } catch (error) {
        return false;
      }
    },

    async jwt({ token, trigger, session, user }) {
      try {
        await dbConnect();
        
        // Initial Login
        if (user) {
          const dbUser = await User.findOne({ email: user.email }).lean();
          if (dbUser) {
            token.role = SUPER_ADMIN_EMAILS.includes(dbUser.email) ? "admin" : (dbUser.role || "user");
            token.sub = dbUser._id.toString();
            token.picture = dbUser.image;
            token.name = dbUser.name;
          }
        }

        // 🟢 HANDLE REAL-TIME UPDATES FROM CLIENT
        if (trigger === "update" && session) {
          if (session.image) token.picture = session.image;
          if (session.name) token.name = session.name;
        }
      } catch (error) {
        console.error("JWT Error:", error);
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role; 
        session.user.image = token.picture; // Synchronizes Navbar image
        session.user.name = token.name;     // Synchronizes Navbar name
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
};

export const auth = () => getServerSession(authOptions);
export default NextAuth(authOptions);