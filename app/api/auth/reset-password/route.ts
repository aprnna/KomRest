import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "unauthorized", 401);
  }

  const { currentPassword, newPassword } = await req.json();

  if (!newPassword) {
    return getResponse(null, "new password is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return getResponse(null, "user not found", 404);
  }

  if (currentPassword) {
    const isValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isValid) {
      return getResponse(null, "current password is invalid", 400);
    }
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash,
      mustResetPassword: false,
      updatedAt: new Date(),
    },
  });

  return getResponse(null, "password updated", 200);
}
