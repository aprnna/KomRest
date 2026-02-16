import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  const dataRiwayat = await prisma.mengelolaBahan.findMany({
    include: {
      user: {
        select: {
          nama: true,
        },
      },
      stock: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const data = dataRiwayat.map((riwayat) => ({
    nama_user: riwayat.user?.nama,
    jumlah: riwayat.jumlah,
    createdAt: riwayat.createdAt,
    proses: riwayat.proses,
    nama_bahan: riwayat.stock?.nama,
  }));

  return getResponse(data, "Bahan Baku fetched successfully", 200);
}
