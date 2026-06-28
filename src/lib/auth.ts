import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { sendWelcomeEmail } from '@/lib/notifications/send-email';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, email: true, name: true, image: true, password: true, role: true, emailVerified: true },
        });

        if (!user || !user.password) {
          await bcrypt.compare('dummy', '$2a$12$dummy.hash.to.prevent.timing.attacks');
          return null;
        }

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          role: user.role,
          emailVerified: user.emailVerified,
        } as { id: string; email: string; name: string | null; image: string | null; role: Role; emailVerified: boolean };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          let dbUser = await db.user.findUnique({ where: { email: user.email! } });

          if (!dbUser) {
            dbUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name ?? null,
                image: user.image ?? null,
                emailVerified: true,
                role: 'CUSTOMER',
              },
            });

            const freePlan = await db.plan.findUnique({ where: { tier: 'FREE' } });
            if (freePlan) {
              await db.subscription.create({
                data: { userId: dbUser.id, planId: freePlan.id, status: 'ACTIVE' },
              });
            }

            // Non-blocking welcome email for new Google users
            sendWelcomeEmail(dbUser.email, dbUser.name).catch(() => {});
          } else if (user.image && !dbUser.image) {
            await db.user.update({ where: { id: dbUser.id }, data: { image: user.image } });
          }

          user.id = dbUser.id;
          (user as Record<string, unknown>).role = dbUser.role;
          (user as Record<string, unknown>).emailVerified = dbUser.emailVerified;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role ?? 'CUSTOMER';
        token.emailVerified = (user as Record<string, unknown>).emailVerified ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
});

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: Role;
      emailVerified: boolean;
    };
  }
  interface JWT {
    id: string;
    role: Role;
    emailVerified: boolean;
  }
}
