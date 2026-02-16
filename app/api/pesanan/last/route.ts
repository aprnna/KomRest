import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";

export async function GET() {
  try {
    const pesanan = await prisma.pesanan.findMany({
      select: {
        id: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    return getResponse(pesanan, "Pesanan fetched successfully", 200);
  } catch (error) {
    console.error("Failed to fetch last id", error);

    return getResponse(error, "Failed to fetch last id", 500);
  }
}
