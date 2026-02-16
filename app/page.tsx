import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getRedirectForRole } from "@/lib/role";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  redirect(getRedirectForRole(session.user.role));
}
