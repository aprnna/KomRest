import { differenceInMinutes } from "date-fns";
import { NextRequest } from "next/server";

import { decimalToNumber } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function POST(req: NextRequest) {
  const { start, end } = await req.json();

  try {
    const pesanan = await prisma.pesanan.findMany({
      where: {
        status: "selesai",
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      select: {
        totalHarga: true,
        status: true,
        createdAt: true,
        updateAt: true,
        reservasi: {
          select: {
            banyakOrang: true,
          },
        },
      },
    });

    let profit = 0;
    let banyakPelanggan = 0;
    let totalDifferenceInMinutes = 0;

    for (const item of pesanan) {
      profit += decimalToNumber(item.totalHarga) ?? 0;
      banyakPelanggan += item.reservasi?.banyakOrang ?? 0;

      if (item.updateAt) {
        totalDifferenceInMinutes += differenceInMinutes(item.updateAt, item.createdAt);
      }
    }

    const rataRataPesananSelesaiDalamJam =
      pesanan.length > 0 ? totalDifferenceInMinutes / pesanan.length / 60 : 0;

    return getResponse(
      {
        profit,
        banyakPelanggan,
        rataRataPesananSelesaiDalamJam,
      },
      "profit fetched successfully",
      200,
    );
  } catch (error) {
    return getResponse(error, "error fetching profit", 400);
  }
}
