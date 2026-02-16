import { auth } from "@/auth";

import getResponse from "@/utils/getResponse";

export async function getCurrentUser() {
  const session = await auth();

  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return {
      user: null,
      errorResponse: await getResponse(null, "unauthorized", 401),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}
