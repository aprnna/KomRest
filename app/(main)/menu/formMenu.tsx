import React, { useState } from "react";
import { Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
export default function FormMenu({ initialData }: { initialData?: any }) {
  let { nama, harga, kategori } = initialData || {};
  const [data, setData] = useState({
    nama: nama || "",
    harga: harga || "",
    kategori: kategori || "",
  });
  const KategoriList = [
    {
      key: "makanan",
      label: "Makanan",
    },
    {
      key: "minuman",
      label: "Minuman",
    },
    {
      key: "cemilan",
      label: "Cemilan",
    },
    {
      key: "hidangan_utama",
      label: "Hidangan Utama",
    },
    {
      key: "pencuci_mulut",
      label: "Pencuci Mulut",
    },
  ];

  return (
    <>
      <Input
        required
        label="Nama Menu"
        labelPlacement="outside"
        name="nama"
        value={data.nama}
        onChange={(e) => setData({ ...data, nama: e.target.value })}
        placeholder="Nama Bahan Baku"
        size="lg"
      />
      <Input
        required
        label="Harga Jual"
        labelPlacement="outside"
        name="harga"
        value={data.harga}
        type="number"
        onChange={(e) => setData({ ...data, harga: e.target.value })}
        placeholder="harga"
        size="lg"
      />
      <Select
        required
        label="Kategori"
        labelPlacement="outside"
        name="kategori"
        defaultSelectedKeys={[`${data.kategori}`]}
        onChange={(e) => setData({ ...data, kategori: e.target.value })}
        placeholder="Kategori"
        size="lg"
      >
        {KategoriList.map((kategori) => (
          <SelectItem key={kategori.key}>{kategori.label}</SelectItem>
        ))}
      </Select>
      <label>
        <p>Foto</p>
        <input name="foto" type="file" />
      </label>
    </>
  );
}
