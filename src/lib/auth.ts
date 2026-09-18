import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Tenant owners resolve their tenant via the Tenant.ownerId link
        // (User has no tenantId column — the relation is the other way).
        let tenantId: string | null = null;
        if (user.role === "TENANT") {
          const tenant = await db.tenant.findFirst({
            where: { ownerId: user.id },
          });
          tenantId = tenant?.id ?? null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId,
        };
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => !!auth?.user,
    jwt: async ({ token, user }) => {
      // `user` is only present on the initial sign-in (the Credentials
      // authorize return value). After that, the token is re-emitted on
      // every request and we must preserve role/tenantId.
      if (user) {
        const u = user as unknown as {
          id: string;
          role: string;
          tenantId: string | null;
        };
        token.uid = u.id;
        token.role = u.role as "ADMIN" | "TENANT";
        token.tenantId = u.tenantId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.uid) {
        const u = session.user as {
          id?: string;
          role?: string;
          tenantId?: string | null;
        };
        u.id = token.uid as string;
        u.role = (token.role as string) ?? "TENANT";
        u.tenantId = (token.tenantId as string | null) ?? null;
      }
      return session;
    },
  },
});