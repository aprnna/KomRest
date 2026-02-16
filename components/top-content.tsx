"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import fetchApi from "@/utils/fetchApi";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
const TopContent = (): React.JSX.Element => {
  const pathname = usePathname();
  const [data, setData] = useState({ nama: "", role: "" });
  const [loading, setLoading] = useState(true);

  const pathTitles: { [key: string]: string } = {
    "/": "Home",
    "/pesanan/add": "Manajemen Menu",
    "/pesanan": "Pesanan",
    "/menu": "Menu",
    "/pesanan/ongoing": "Pesanan Diproses",
    "/bahan_baku": "Bahan Baku",
    "/bahan_baku/riwayat": "Riwayat Bahan Baku",
    "/admin": "Laporan",
    "/admin/karyawan": "Kelola Karyawan",
    "/reservasi": "Reservasi"
  };

  async function getUser() {
    const { data } = await fetchApi("/auth/current-user", "GET");

    setData(data);
    setLoading(false);

    return data;
  }
  useEffect(() => {
    getUser();
  }, []);
  const currentTitle = pathTitles[pathname] || "Menu";

  return (
    <div className="flex bg-amber-950 text-red-100 justify-between items-center py-2 px-8 ">
      <div className="flex gap-5 items-center">
        {/* <button className="bg-orange-900 p-2 rounded-lg hover:bg-orange-600 transition-all duration-300">
          <img alt="" src="../arrow-left.svg" />
        </button> */}
        <Breadcrumbs
          itemClasses={{
            separator: "text-white",
          }}
        >
          {pathname == "/bahan_baku/riwayat" && (
            <BreadcrumbItem href="/bahan_baku">
              <h1 className="text-lg text-foreground-200">Bahan Baku</h1>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem href={pathname}>
            <h1 className="text-lg text-white">{currentTitle}</h1>
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex gap-4 items-center">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <img
              alt="profile.png"
              className="max-h-12 hover:brightness-90 hover:cursor-pointer"
              src="../profile.png"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="logout" color="danger">
              <form method="POST" action="/api/auth/logout">
                <button type="submit" className="w-full text-left">
                  Log Out
                </button>
              </form>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <div className="text-md py-2">
          <p className="text-red-300 font-bold">
            {loading ? "Role" : data?.role}
          </p>
          <p>{loading ? "Nama" : data?.nama}</p>
        </div>
      </div>
    </div>
  );
};

export default TopContent;
