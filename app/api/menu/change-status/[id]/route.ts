import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function PUT(req: NextRequest, { params }: any) {
  const rawId = (await Promise.resolve(params))?.id;
  if (typeof rawId !== "string" || !/^\d+$/.test(rawId)) {
    return getResponse(null, "Invalid menu id", 400);
  }

  const id = BigInt(rawId);

  const data = await prisma.menu.findUnique({
    where: { id },
    select: { tersedia: true },
  });

  if (!data) {
    return getResponse(null, "Failed get menu", 404);
  }

  const updateData = await prisma.menu.update({
    where: { id },
    data: {
      tersedia: !data.tersedia,
    },
  });

  return getResponse(updateData, "Success Update Menu", 200);
}
