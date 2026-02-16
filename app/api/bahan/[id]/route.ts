import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

async function getStockId(params: any) {
  const rawId = (await Promise.resolve(params))?.id;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function PUT(req: NextRequest, { params }: any) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const id = await getStockId(params);
  if (id === null) {
    return getResponse(null, "Invalid stock id", 400);
  }

  const { nama, jumlah, satuan } = await req.json();

  try {
    const updateData = await prisma.bahanBaku.update({
      where: { id },
      data: {
        nama,
        jumlah: Number(jumlah),
        satuan,
      },
    });

    await prisma.mengelolaBahan.create({
      data: {
        jumlah: updateData.jumlah,
        idUser: session.user.id,
        idStock: id,
        proses: "Edit",
      },
    });

    return getResponse(updateData, "Success Update bahan baku", 200);
  } catch (error) {
    return getResponse(error, "Failed update bahan baku", 400);
  }
}

export async function GET(_req: NextRequest, { params }: any) {
  const id = await getStockId(params);
  if (id === null) {
    return getResponse(null, "Invalid stock id", 400);
  }

  const data = await prisma.bahanBaku.findMany({
    where: {
      id,
    },
  });

  return getResponse(data, "Success Get bahan baku", 200);
}

export async function DELETE(req: NextRequest, { params }: any) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const id = await getStockId(params);
  if (id === null) {
    return getResponse(null, "Invalid stock id", 400);
  }

  try {
    const data = await prisma.bahanBaku.update({
      where: { id },
      data: {
        status: false,
      },
    });

    await prisma.mengelolaBahan.create({
      data: {
        jumlah: data.jumlah,
        idUser: session.user.id,
        idStock: data.id,
        proses: "Delete",
      },
    });

    return getResponse(data, "Success Delete bahan baku", 200);
  } catch (error) {
    return getResponse(error, "Failed delete bahan baku", 400);
  }
}
