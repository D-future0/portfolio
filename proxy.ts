import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin");

  if (isLoginPage) {
    if (isLoggedIn) {
      const destination = req.auth?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(destination, req.nextUrl));
    }
    return NextResponse.next();
  }

  if ((isAdminRoute || isAdminApi) && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
