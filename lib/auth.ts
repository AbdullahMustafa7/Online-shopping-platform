import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import { User } from "./models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        const match = await bcrypt.compare(password, user.password);
        if (!match) return null;

        return {
          id: String(user._id),
          email: user.email,
          name: user.name ?? "",
          role: user.role ?? "customer",
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role ?? "customer";
      }
      return session;
    },
  },
};

