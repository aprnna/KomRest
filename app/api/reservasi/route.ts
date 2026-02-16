import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  const reservasi = await prisma.reservasi.findMany({
    include: {
      user: {
        select: {
          nama: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  const transformReservasiData = reservasi.map((item) => ({
    id: item.id,
    id_user: item.idUser,
    no_meja: item.noMeja,
    tanggal: item.tanggal,
    atas_nama: item.atasNama,
    banyak_orang: item.banyakOrang,
    no_telp: item.noTelp,
    status: item.status,
    nama_pelayan: item.user?.nama,
  }));

  return getResponse(transformReservasiData, "Pesanan fetched successfully", 200);
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const { atasNama, jumlahOrang, nomorHp, noMeja, tanggal } = await req.json();

  let status = "";

  if (!noMeja) {
    status = "waiting";
  } else {
    status = "ontable";
    const meja = await prisma.meja.findUnique({
      where: {
        noMeja: Number(noMeja),
      },
      select: {
        kapasitas: true,
      },
    });

    if (!meja) {
      return getResponse(null, "Failed to fetch table data", 500);
    }

    if ((jumlahOrang ?? 0) > (meja.kapasitas ?? 0)) {
      return getResponse(null, "Jumlah orang melebihi kapasitas meja", 400);
    }
  }

  try {
    const reservasi = await prisma.reservasi.create({
      data: {
        idUser: session.user.id,
        noMeja: noMeja ? Number(noMeja) : null,
        status,
        atasNama,
        banyakOrang: Number(jumlahOrang),
        noTelp: nomorHp,
        tanggal: tanggal ? new Date(tanggal) : null,
      },
    });

    if (status === "ontable" && noMeja) {
      await prisma.meja.update({
        where: {
          noMeja: Number(noMeja),
        },
        data: {
          status: "Full",
        },
      });
    }

    return getResponse(
      {
        id: reservasi.id,
        id_user: reservasi.idUser,
        no_meja: reservasi.noMeja,
        tanggal: reservasi.tanggal,
        atas_nama: reservasi.atasNama,
        banyak_orang: reservasi.banyakOrang,
        no_telp: reservasi.noTelp,
        status: reservasi.status,
      },
      "Bahan insert successfully",
      201,
    );
  } catch (error) {
    console.error("Reservasi insert failed", error);

    return getResponse(error, "Reservasi insert failed", 400);
  }
}
