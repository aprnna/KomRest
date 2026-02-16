import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

async function getUserId(params: any) {
  const id = (await Promise.resolve(params))?.id;

  if (typeof id !== "string" || id.length === 0) {
    return null;
  }

  return id;
}

export async function PUT(req: NextRequest, { params }: any) {
  const id = await getUserId(params);
  if (!id) {
    return getResponse(null, "Invalid user id", 400);
  }

  const { nama, umur, no_telp, no_hp, role } = await req.json();

  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        nama: nama ?? undefined,
        umur: umur ? Number(umur) : null,
        noTelp: no_telp || no_hp ? String(no_telp ?? no_hp) : null,
        role: role ?? undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        createdAt: true,
        umur: true,
        role: true,
        noTelp: true,
        nama: true,
        updatedAt: true,
        email: true,
      },
    });

    return getResponse(
      {
        ...user,
        no_telp: user.noTelp,
      },
      "users fetched successfully",
      200,
    );
  } catch (error) {
    return getResponse(error, "error update user", 400);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const id = await getUserId(params);
  if (!id) {
    return getResponse(null, "Invalid user id", 400);
  }

  try {
    const data = await prisma.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        createdAt: true,
        umur: true,
        role: true,
        noTelp: true,
        nama: true,
        updatedAt: true,
        email: true,
      },
    });

    return getResponse(
      {
        ...data,
        no_telp: data.noTelp,
      },
      "user delete successfully",
      200,
    );
  } catch (error) {
    return getResponse(error, "error delete user", 400);
  }
}
