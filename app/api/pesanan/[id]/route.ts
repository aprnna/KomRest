import { NextRequest } from "next/server";

import { decimalToNumber } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

async function getOrderId(params: any) {
  const rawId = (await Promise.resolve(params))?.id;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(_req: NextRequest, { params }: any) {
  const id = await getOrderId(params);

  if (id === null) {
    return getResponse(null, "Invalid order id", 400);
  }

  try {
    const orderData = await prisma.pesanan.findMany({
      where: {
        id,
      },
      select: {
        id: true,
        idUser: true,
        createdAt: true,
        reservasi: {
          select: {
            atasNama: true,
            banyakOrang: true,
          },
        },
      },
    });

    const items = await prisma.itemPesanan.findMany({
      where: {
        idPesanan: id,
      },
    });

    const menuIds = items
      .map((item) => item.idMenu)
      .filter((menuId): menuId is bigint => menuId !== null);

    const menuDetails =
      menuIds.length > 0
        ? await prisma.menu.findMany({
            where: {
              id: {
                in: menuIds,
              },
            },
          })
        : [];

    const order = orderData.map((item) => ({
      id: item.id,
      id_user: item.idUser,
      createdAt: item.createdAt,
      atas_nama: item.reservasi?.atasNama,
      banyak_orang: item.reservasi?.banyakOrang,
    }));

    return getResponse(
      {
        order,
        items: items.map((item) => ({
          id: item.id,
          id_menu: item.idMenu,
          id_pesanan: item.idPesanan,
          jumlah: item.jumlah,
        })),
        menuDetails: menuDetails.map((menu) => ({
          ...menu,
          harga: decimalToNumber(menu.harga),
        })),
      },
      "Success Get pesanan",
      200,
    );
  } catch (error) {
    return getResponse(error, "Failed get order", 400);
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  const id = await getOrderId(params);
  if (id === null) {
    return getResponse(null, "Invalid order id", 400);
  }

  const { status } = await req.json();

  try {
    const updatedOrder = await prisma.pesanan.update({
      where: {
        id,
      },
      data: {
        status,
        updateAt: new Date(),
      },
    });

    return getResponse(updatedOrder, "Successfully updated pesanan", 200);
  } catch (error) {
    return getResponse(error, "Failed to update order", 400);
  }
}
