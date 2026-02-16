import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const dataUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      nama: true,
      umur: true,
      role: true,
      noTelp: true,
      createdAt: true,
      updatedAt: true,
      email: true,
    },
  });

  if (!dataUser) {
    return getResponse(null, "error get user", 404);
  }

  return getResponse(
    {
      ...dataUser,
      no_telp: dataUser.noTelp,
    },
    "success get user",
    200,
  );
}
