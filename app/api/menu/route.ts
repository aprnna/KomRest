import { NextRequest } from "next/server";

import { decimalToNumber } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
import { deleteStoredImage, uploadMenuImage } from "@/lib/storage";
import getResponse from "@/utils/getResponse";

export const runtime = "nodejs";

export async function GET() {
  const menu = await prisma.menu.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return getResponse(
    menu.map((item) => ({
      ...item,
      harga: decimalToNumber(item.harga),
    })),
    "Menu fetched successfully",
    200,
  );
}

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const foto = data.get("foto") as File | null;

  if (!foto || foto.size <= 0) {
    return getResponse(null, "Image is required", 400);
  }

  let uploaded: { key: string; publicUrl: string } | null = null;

  try {
    uploaded = await uploadMenuImage(foto, String(data.get("nama") ?? "menu"));

    const menu = await prisma.menu.create({
      data: {
        nama: String(data.get("nama") ?? ""),
        harga: String(data.get("harga") ?? "0"),
        kategori: String(data.get("kategori") ?? ""),
        foto: uploaded.publicUrl,
        fotoKey: uploaded.key,
      },
    });

    return getResponse(
      {
        ...menu,
        harga: decimalToNumber(menu.harga),
      },
      "Menu Post successfully",
      201,
    );
  } catch (error) {
    if (uploaded) {
      await deleteStoredImage(uploaded.key);
    }

    console.error("Menu Post failed", error);

    return getResponse(error, "Menu Post failed", 400);
  }
}
