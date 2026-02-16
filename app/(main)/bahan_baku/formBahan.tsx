import React, { useState } from "react";
import { Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
export default function FormBahan({ initialData }: { initialData?: any }) {
  let { nama, jumlah, satuan } = initialData || {};
  const [data, setData] = useState({
    nama: nama || "",
    jumlah: jumlah || "",
    satuan: satuan || "",
  });
  const satuanList = [
    {
      key: "kg",
      label: "Kilogram",
    },
    {
      key: "gr",
      label: "Gram",
    },
    {
      key: "ons",
      label: "Ons",
    },
    {
      key: "lt",
      label: "Liter",
    },
    {
      key: "ml",
      label: "Mililiter",
    },
    {
      key: "pcs",
      label: "Pcs",
    },
  ];

  return (
    <>
      <Input
        label="Nama Bahan"
        labelPlacement="outside"
        name="nama"
        value={data.nama}
        onChange={(e) => setData({ ...data, nama: e.target.value })}
        placeholder="Nama Bahan Baku"
        size="lg"
      />
      <div className="flex gap-5">
        <Input
          label="Jumlah"
          labelPlacement="outside"
          name="jumlah"
          value={data.jumlah}
          onChange={(e) => setData({ ...data, jumlah: e.target.value })}
          placeholder="Jumlah"
          size="lg"
        />
        <Select
          label="Satuan"
          labelPlacement="outside"
          name="satuan"
          defaultSelectedKeys={[`${data.satuan}`]}
          onChange={(e) => setData({ ...data, satuan: e.target.value })}
          placeholder="Satuan"
          size="lg"
        >
          {satuanList.map((satuan) => (
            <SelectItem key={satuan.key}>{satuan.label}</SelectItem>
          ))}
        </Select>
      </div>
    </>
  );
}
