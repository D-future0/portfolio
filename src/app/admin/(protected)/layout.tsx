import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { SessionProvider } from "@/components/admin/session-provider";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side check — the real auth boundary. Middleware only redirects
  // for a smoother UX; this is what actually gates the data underneath.
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-paper">
        <AdminNav />
        <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      </div>
    </SessionProvider>
  );
}
