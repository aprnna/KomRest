import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { decimalToNumber } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  try {
    const pesananData = await prisma.pesanan.findMany({
      select: {
        id: true,
        noMeja: true,
        createdAt: true,
        totalHarga: true,
        status: true,
        idReservasi: true,
        reservasi: {
          select: {
            atasNama: true,
            banyakOrang: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pesanan = pesananData.map((item) => ({
      id: item.id,
      no_meja: item.noMeja,
      createdAt: item.createdAt,
      total_harga: decimalToNumber(item.totalHarga),
      status: item.status,
      id_reservasi: item.idReservasi,
      atas_nama: item.reservasi?.atasNama,
      banyak_orang: item.reservasi?.banyakOrang,
    }));

    return getResponse(pesanan, "Pesanan fetched successfully", 200);
  } catch {
    return getResponse(null, "Error fetching pesanan", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "failed to get user data", 401);
  }

  const { idReservasi, no_meja, status, total_harga, items } = await req.json();

  try {
    const pesananBaru = await prisma.$transaction(async (tx) => {
      const order = await tx.pesanan.create({
        data: {
          noMeja: no_meja ? Number(no_meja) : null,
          status,
          totalHarga: String(total_harga ?? 0),
          idUser: session.user.id,
          idReservasi: idReservasi ? Number(idReservasi) : null,
        },
      });

      for (const item of items ?? []) {
        await tx.itemPesanan.create({
          data: {
            idPesanan: order.id,
            idMenu: BigInt(item.id_menu),
            jumlah: Number(item.jumlah),
          },
        });
      }

      return order;
    });

    return getResponse(pesananBaru, "Pesanan created successfully", 200);
  } catch (error) {
    console.error("Pesanan Post failed", error);

    return getResponse(error, "Pesanan Post failed", 400);
  }
}
