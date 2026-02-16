import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  const menu = await prisma.bahanBaku.findMany({
    where: {
      status: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return getResponse(menu, "Bahan Baku fetched successfully", 200);
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const { nama, jumlah, satuan } = await req.json();

  try {
    const bahanBaku = await prisma.bahanBaku.create({
      data: {
        nama,
        jumlah: Number(jumlah),
        satuan,
      },
    });

    await prisma.mengelolaBahan.create({
      data: {
        jumlah: Number(jumlah),
        idUser: session.user.id,
        idStock: bahanBaku.id,
        proses: "Create",
      },
    });

    return getResponse(bahanBaku, "Bahan insert successfully", 201);
  } catch (error) {
    console.error("Bahan insert failed", error);

    return getResponse(error, "Bahan insert failed", 400);
  }
}
