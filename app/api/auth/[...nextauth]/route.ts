import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/model/user";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          name: user.name,
          email: user.email,
          role: "developer", // default role
        });
        await newUser.save();
      }

      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
