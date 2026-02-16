import getResponse from "@/utils/getResponse";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const meja = await prisma.meja.findMany({
    orderBy: {
      noMeja: "asc",
    },
  });

  return getResponse(
    meja.map((item) => ({
      no_meja: item.noMeja,
      kapasitas: item.kapasitas,
      status: item.status,
    })),
    "Meja fetched successfully",
    200,
  );
}
