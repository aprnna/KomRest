import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

async function getTableId(params: any) {
  const rawId = (await Promise.resolve(params))?.id;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(_req: NextRequest, { params }: any) {
  const id = await getTableId(params);

  if (id === null) {
    return getResponse(null, "Invalid table id", 400);
  }

  const meja = await prisma.meja.findUnique({
    where: {
      noMeja: id,
    },
  });

  if (!meja) {
    return new NextResponse("Table not found", { status: 404 });
  }

  const reservasi = await prisma.reservasi.findMany({
    where: {
      noMeja: meja.noMeja,
      status: "ontable",
    },
    include: {
      user: {
        select: {
          nama: true,
        },
      },
    },
  });

  const responseData = {
    meja: {
      no_meja: meja.noMeja,
      kapasitas: meja.kapasitas,
      status: meja.status,
    },
    reservasi:
      reservasi.length > 0
        ? reservasi.map((item) => ({
            id: item.id,
            id_user: item.idUser,
            no_meja: item.noMeja,
            tanggal: item.tanggal,
            atas_nama: item.atasNama,
            banyak_orang: item.banyakOrang,
            no_telp: item.noTelp,
            status: item.status,
            users: {
              nama: item.user?.nama,
            },
          }))
        : null,
  };

  return getResponse(responseData, "Data fetched successfully", 200);
}

export async function PUT(_req: NextRequest, { params }: any) {
  const id = await getTableId(params);

  if (id === null) {
    return getResponse(null, "Invalid table id", 400);
  }

  const meja = await prisma.meja.findUnique({
    where: {
      noMeja: id,
    },
  });

  if (!meja) {
    return new NextResponse("Table not found", { status: 404 });
  }

  const ontableReservations = await prisma.reservasi.findMany({
    where: {
      noMeja: meja.noMeja,
      status: "ontable",
    },
  });

  await prisma.reservasi.updateMany({
    where: {
      id: {
        in: ontableReservations.map((item) => item.id),
      },
    },
    data: {
      status: "done",
    },
  });

  await prisma.meja.update({
    where: {
      noMeja: meja.noMeja,
    },
    data: {
      status: "Available",
    },
  });

  return getResponse(
    {
      meja: {
        no_meja: meja.noMeja,
        kapasitas: meja.kapasitas,
        status: "Available",
      },
      reservasi: ontableReservations.map((item) => ({
        id: item.id,
        id_user: item.idUser,
        no_meja: item.noMeja,
        tanggal: item.tanggal,
        atas_nama: item.atasNama,
        banyak_orang: item.banyakOrang,
        no_telp: item.noTelp,
        status: "done",
      })),
    },
    "Table and reservations updated successfully",
    200,
  );
}
