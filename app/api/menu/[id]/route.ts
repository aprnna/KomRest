import { NextRequest } from "next/server";

import { decimalToNumber } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
import { deleteStoredImage, uploadMenuImage } from "@/lib/storage";
import getResponse from "@/utils/getResponse";

export const runtime = "nodejs";

async function getMenuId(params: any) {
  const rawId = (await Promise.resolve(params))?.id;

  if (typeof rawId !== "string" || !/^\d+$/.test(rawId)) {
    return null;
  }

  return BigInt(rawId);
}

export async function PUT(req: NextRequest, { params }: any) {
  const data = await req.formData();
  const id = await getMenuId(params);
  if (id === null) {
    return getResponse(null, "Invalid menu id", 400);
  }

  const newDataImg = data.get("foto") as File | null;

  const currentMenu = await prisma.menu.findUnique({
    where: {
      id,
    },
  });

  if (!currentMenu) {
    return getResponse(null, "Failed update menu", 404);
  }

  let uploaded: { key: string; publicUrl: string } | null = null;

  try {
    if (newDataImg && newDataImg.size > 0) {
      uploaded = await uploadMenuImage(newDataImg, String(data.get("nama") ?? currentMenu.nama));
    }

    const updateData = await prisma.menu.update({
      where: {
        id,
      },
      data: {
        nama: String(data.get("nama") ?? currentMenu.nama),
        harga: String(data.get("harga") ?? currentMenu.harga),
        kategori: String(data.get("kategori") ?? currentMenu.kategori),
        foto: uploaded?.publicUrl ?? String(data.get("oldFoto") ?? currentMenu.foto ?? ""),
        fotoKey: uploaded?.key ?? currentMenu.fotoKey,
      },
    });

    if (uploaded && (currentMenu.fotoKey || currentMenu.foto)) {
      await deleteStoredImage(currentMenu.fotoKey ?? currentMenu.foto);
    }

    return getResponse(
      {
        ...updateData,
        harga: decimalToNumber(updateData.harga),
      },
      "Success Update Menu",
      200,
    );
  } catch (error) {
    if (uploaded) {
      await deleteStoredImage(uploaded.key);
    }

    return getResponse(error, "Failed update menu", 400);
  }
}

export async function GET(_req: NextRequest, { params }: any) {
  const id = await getMenuId(params);
  if (id === null) {
    return getResponse(null, "Invalid menu id", 400);
  }

  const data = await prisma.menu.findUnique({
    where: {
      id,
    },
  });

  if (!data) {
    return getResponse(null, "Failed get menu", 404);
  }

  return getResponse(
    {
      ...data,
      harga: decimalToNumber(data.harga),
    },
    "Success Get Menu",
    200,
  );
}

export async function DELETE(_req: NextRequest, { params }: any) {
  const id = await getMenuId(params);
  if (id === null) {
    return getResponse(null, "Invalid menu id", 400);
  }

  const data = await prisma.menu.delete({
    where: {
      id,
    },
  });

  if (data.fotoKey || data.foto) {
    await deleteStoredImage(data.fotoKey ?? data.foto);
  }

  return getResponse(data, "Success Delete Menu", 200);
}
