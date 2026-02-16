import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const authCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  for (const cookieName of authCookieNames) {
    cookieStore.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
    });
  }

  return NextResponse.redirect(new URL("/auth/login", req.url), {
    status: 302,
  });
}
