import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import AccountForm from "./account-form";

export default async function Account() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      nama: true,
      umur: true,
      role: true,
      noTelp: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <AccountForm user={user} />;
}
