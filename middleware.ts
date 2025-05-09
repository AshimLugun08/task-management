// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow public routes (e.g., login, API)
      if (req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname === '/login') {
        return true;
      }
      // Require authentication for protected routes
      return !!token; // True if user is logged in
    },
  },
});

export const config = {
  matcher: ['/dashboard', '/board', '/projects'], // Protect these routes
};