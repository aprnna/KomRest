import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import getResponse from "@/utils/getResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password, nama, umur, no_telp, no_hp, role } = await req.json();

  if (!email || !nama || !role) {
    return getResponse(null, "invalid payload", 400);
  }

  try {
    const passwordHash = await hashPassword(password || "password123");

    const dataAuth = await prisma.user.create({
      data: {
        email: String(email).toLowerCase(),
        passwordHash,
        mustResetPassword: false,
        nama: String(nama),
        umur: umur ? Number(umur) : null,
        noTelp: no_telp || no_hp ? String(no_telp ?? no_hp) : null,
        role: String(role),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
      },
    });

    return getResponse(dataAuth, "success create new user", 200);
  } catch (error) {
    console.error(error);

    return getResponse(error, "error create new user", 400);
  }
}
