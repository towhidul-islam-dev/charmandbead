import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb"; 
import User from "@/models/User"; 
import bcrypt from "bcryptjs";

export const authOptions = {
  trustHost: true, // 🟢 CRITICAL FOR MOBILE: Trusts proxy headers on Vercel and prevents cookie drops
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        // Ensure credentials exist to avoid destructuring errors
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const { email, password } = credentials;

        try {
          await dbConnect();
          
          // Find user and explicitly select password if it's hidden by default in your model
          const user = await User.findOne({ email : email.toLowerCase() }).select("+password");

          if (!user || !user.password) {
            throw new Error("No user found with this email");
          }

          // bcrypt.compare(plainPassword, hashedBycryptPassword)
          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordsMatch) {
            throw new Error("Invalid password");
          }

          // Return the user object (this goes to the JWT callback)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth Error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    // 🟢 Ensures redirects stay safely on your domain for mobile devices
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };