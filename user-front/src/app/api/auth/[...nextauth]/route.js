import NextAuth from 'next-auth';
import { options } from './options';
const handler = NextAuth(options);
export { handler as GET, handler as POST };

// NEXTAUTH_URL kontrolü
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3001';
}