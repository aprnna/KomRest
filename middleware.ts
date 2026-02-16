import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { canAccessPath } from "@/lib/role";

const allowedPaths = ["/error/unauthorized", "/error"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (pathname.startsWith("/api") || pathname.startsWith("/auth") || allowedPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (!canAccessPath(token.role as string | undefined, pathname)) {
    return NextResponse.redirect(new URL("/error/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
