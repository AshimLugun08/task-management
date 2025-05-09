// lib/auth.ts
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    // Your providers, e.g.:
    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     email: { label: 'Email', type: 'email' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials) {
    //     // Your auth logic
    //     return null; // Return user object or null
    //   },
    // }),
  ],
  pages: {
    signIn: '/login', // Redirect to custom login page
  },
};