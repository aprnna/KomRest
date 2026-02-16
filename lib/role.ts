export const roleAccess: Record<string, string[]> = {
  manager: ["/admin", "/admin/karyawan"],
  koki: ["/menu", "/pesanan/ongoing"],
  karyawan: ["/bahan_baku", "/bahan_baku/riwayat"],
  pelayan: ["/reservasi", "/pesanan/add", "/pesanan"],
};

export function getRedirectForRole(role?: string | null) {
  switch (role) {
    case "manager":
      return "/admin";
    case "pelayan":
      return "/reservasi";
    case "koki":
      return "/pesanan/ongoing";
    case "karyawan":
      return "/bahan_baku";
    default:
      return "/error";
  }
}

export function canAccessPath(role: string | undefined, pathname: string) {
  if (!role) {
    return false;
  }

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    return true;
  }

  const allowedRoutes = roleAccess[role] ?? [];

  return allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
