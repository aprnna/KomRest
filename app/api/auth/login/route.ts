import { NextRequest, NextResponse } from "next/server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRedirectForRole } from "@/lib/role";
import getResponse from "@/utils/getResponse";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return getResponse(null, "email and password are required", 400);
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if ((result as any)?.error) {
      return getResponse((result as any).error, "error login", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return NextResponse.redirect(new URL(getRedirectForRole(user?.role), req.url));
  } catch (error) {
    console.error(error);

    return getResponse(error, "error login", 400);
  }
}
