import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const SUPER_ADMIN_EMAILS = ["towhidulislam12995@gmail.com", "dev@admin.com"];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          await dbConnect();
          const user = await User.findOne({
            email: email.toLowerCase().trim(),
          });

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
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser && account.provider === "google") {
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

    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign-in: Standardize the token with DB data
      if (user) {
        token.role = SUPER_ADMIN_EMAILS.includes(user.email) ? "admin" : (user.role || "user");
        token.sub = user._id?.toString() || user.id?.toString();
        token.email = user.email;
        token.name = user.name;
        // Map custom 'image' or Google 'picture' to the standard token.picture
        token.picture = user.image || user.picture; 
      }

      // 2. Handle manual updates (from ProfileForm.jsx update call)
      if (trigger === "update" && session) {
        if (session.image) token.picture = session.image;
        if (session.picture) token.picture = session.picture;
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
        // Return immediately to ensure update data persists in the token
        return token;
      }

      // 3. Persistent Sync: THE FAILSAFE
      // If image is missing from token but we have an email, fetch from DB.
      // This fixes the "undefined" error on hard refreshes.
      if (!token.picture && token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).select("image role name").lean();
        if (dbUser) {
          token.picture = dbUser.image; 
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        // 🟢 Crucial: Map token.picture back to session.user.image
        // The Navbar reads session.user.image to display the photo
        session.user.image = token.picture; 
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const auth = (...args) => getServerSession(...args, authOptions);
export default NextAuth(authOptions);

export async function authorizeAdmin(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { message: "Authentication required or admin access denied" },
      { status: 403 }
    );
  }
  return null;
}