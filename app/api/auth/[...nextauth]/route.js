import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb"; 
import User from "@/models/User"; 
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        // 1. Ensure credentials exist to avoid destructuring errors
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const { email, password } = credentials;

        try {
          await dbConnect();
          
          // 2. Find user and explicitly select password if it's hidden by default in your model
          const user = await User.findOne({ email : email.toLowerCase() }).select("+password");

          if (!user || !user.password) {
            // Throwing an error provides better feedback than returning null
            throw new Error("No user found with this email");
          }

          // 3. bcrypt.compare(plainPassword, hashedBycryptPassword)
          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordsMatch) {
            throw new Error("Invalid password");
          }

          // 4. Return the user object (this goes to the JWT callback)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          // Log the specific error for debugging
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