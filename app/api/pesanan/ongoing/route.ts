import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";
import { decimalToNumber } from "@/lib/decimal";

export async function GET() {
  try {
    const pesananOngoing = await prisma.pesanan.findMany({
      where: {
        status: "ongoing",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return getResponse(
      pesananOngoing.map((item) => ({
        id: item.id,
        id_user: item.idUser,
        no_meja: item.noMeja,
        createdAt: item.createdAt,
        updateAt: item.updateAt,
        total_harga: decimalToNumber(item.totalHarga),
        status: item.status,
        id_reservasi: item.idReservasi,
      })),
      "Ongoing orders fetched successfully",
      200,
    );
  } catch (error) {
    console.error("Failed to fetch ongoing orders", error);

    return getResponse(error, "Failed to fetch ongoing orders", 500);
  }
}
