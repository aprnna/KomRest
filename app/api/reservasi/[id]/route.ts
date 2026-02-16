import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

async function getReservationId(params: any) {
  const rawId = (await Promise.resolve(params))?.id;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(_req: NextRequest, { params }: any) {
  const id = await getReservationId(params);

  if (id === null) {
    return getResponse(null, "Invalid reservation id", 400);
  }

  const reservasi = await prisma.reservasi.findUnique({
    where: {
      id,
    },
  });

  return getResponse(
    reservasi
      ? {
          id: reservasi.id,
          id_user: reservasi.idUser,
          no_meja: reservasi.noMeja,
          tanggal: reservasi.tanggal,
          atas_nama: reservasi.atasNama,
          banyak_orang: reservasi.banyakOrang,
          no_telp: reservasi.noTelp,
          status: reservasi.status,
        }
      : null,
    "Pesanan fetched successfully",
    200,
  );
}

export async function PUT(req: NextRequest, { params }: any) {
  const session = await auth();

  if (!session?.user?.id) {
    return getResponse(null, "error get user", 401);
  }

  const id = await getReservationId(params);

  if (id === null) {
    return getResponse(null, "Invalid reservation id", 400);
  }

  const { atasNama, jumlahOrang, nomorHp, noMeja, tanggal } = await req.json();

  let status = "";

  if (!noMeja) {
    status = "waiting";

    return getResponse(null, "Silahkan Isi Dahulu No Meja", 400);
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
    const reservasi = await prisma.reservasi.update({
      where: {
        id,
      },
      data: {
        idUser: session.user.id,
        noMeja: Number(noMeja),
        status,
        atasNama,
        banyakOrang: Number(jumlahOrang),
        noTelp: nomorHp,
        tanggal: tanggal ? new Date(tanggal) : null,
      },
    });

    if (status === "ontable") {
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
      "Update Reservasi successfully",
      201,
    );
  } catch (error) {
    console.error("Reservasi update failed", error);

    return getResponse(error, "Reservasi insert failed", 400);
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const id = await getReservationId(params);

  if (id === null) {
    return getResponse(null, "Invalid reservation id", 400);
  }

  try {
    const data = await prisma.reservasi.update({
      where: {
        id,
      },
      data: {
        status: "cancel",
      },
    });

    return getResponse(
      {
        id: data.id,
        id_user: data.idUser,
        no_meja: data.noMeja,
        tanggal: data.tanggal,
        atas_nama: data.atasNama,
        banyak_orang: data.banyakOrang,
        no_telp: data.noTelp,
        status: data.status,
      },
      "Success Delete reservasi",
      200,
    );
  } catch (error) {
    return getResponse(error, "Failed delete reservasi", 400);
  }
}
