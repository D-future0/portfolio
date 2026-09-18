import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TENANT";
      tenantId: string | null;
    } & NonNullable<Session["user"]>;
  }

  interface User {
    role: "ADMIN" | "TENANT";
    tenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "ADMIN" | "TENANT";
    tenantId?: string | null;
  }
}