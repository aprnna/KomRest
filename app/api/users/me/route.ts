import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "unauthorized", 401);
  }

  const { nama, umur, no_telp } = await req.json();

  const data = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      nama: nama ?? undefined,
      umur: typeof umur === "number" ? umur : umur ? Number(umur) : undefined,
      noTelp: no_telp ?? undefined,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      nama: true,
      umur: true,
      role: true,
      noTelp: true,
      email: true,
    },
  });

  return getResponse(data, "profile updated", 200);
}
