import NextAuth from 'next-auth';
import { options } from './options';

// Ensure NEXTAUTH_URL is set correctly for both local and server environments
// This is redundant if already in .env but helpful for debugging/local setup
if (process.env.NODE_ENV === 'development' && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3001';
}

const handler = NextAuth(options);
export { handler as GET, handler as POST };