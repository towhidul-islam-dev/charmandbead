import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// 💡 ADD YOUR EMAILS HERE
const SUPER_ADMIN_EMAILS = [
  "towhidulislam12@gmail.com", 
  "dev@admin.com"
];

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
        console.error("Error saving user to DB:", error);
        return false;
      }
    },

    async jwt({ token, trigger, session }) {
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).lean();

        if (dbUser) {
          // 💡 SUPER ADMIN OVERRIDE
          // Even if the DB is changed, the session remains Admin for these emails
          if (SUPER_ADMIN_EMAILS.includes(dbUser.email)) {
            token.role = "admin";
          } else {
            token.role = dbUser.role || "user";
          }
          token.sub = dbUser._id.toString();
        }

        if (trigger === "update" && session?.image) {
          token.picture = session.image;
        }
      } catch (error) {
        console.error("JWT Callback Error:", error);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role; 
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const auth = () => getServerSession(authOptions);

export async function verifyAuthToken() { 
    try {
        const session = await auth();
        if (!session) return { user: null, error: "Not authenticated" };
        return { user: session.user, error: null };
    } catch (err) {
        return { user: null, error: err.message };
    }
}

export default NextAuth(authOptions);