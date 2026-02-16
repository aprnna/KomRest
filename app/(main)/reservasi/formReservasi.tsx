import React, { useEffect, useState } from "react";
import { Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import fetchApi from "@/utils/fetchApi";
import { DatePicker, TimeInputValue } from "@heroui/react";
import {
  DateValue,
  parseAbsoluteToLocal,
  toLocalTimeZone,
} from "@internationalized/date";

export default function FormReservasi({ initialData }: { initialData?: any }) {
  let { atasNama, jumlah, noHp, noMeja, tanggal } = initialData || {};
  const [data, setData] = useState({
    atasNama: atasNama || "",
    jumlah: jumlah || "",
    noHp: noHp || "",
    noMeja: noMeja || null,
    tanggal: tanggal
      ? (new Date(tanggal).toISOString() as any)
      : (new Date().toISOString() as any),
  });
  const [meja, setMeja] = useState([]);

  const getMeja = async () => {
    const { data } = await fetchApi("/meja", "GET");

    const filteredData = data.filter((item: any) => item.status == "Available");

    const sortedData = filteredData.sort(
      (a: any, b: any) => a.no_meja - b.no_meja
    );

    setMeja(sortedData);
  };

  useEffect(() => {
    getMeja();
  }, []);

  const handleSelectChange = (key: any) => {
    setData((prevData) => ({
      ...prevData,
      noMeja: key,
    }));
  };

  const handleDateChange = (date: any) => {
    const formattedDate = date.toDate("Asia/Bangkok").toISOString();

    setData((prevData) => ({
      ...prevData,
      tanggal: formattedDate,
    }));
  };

  return (
    <>
      <Input
        label="Atas Nama"
        labelPlacement="outside"
        name="atasNama"
        value={data.atasNama}
        onChange={(e) => setData({ ...data, atasNama: e.target.value })}
        placeholder="Masukan Nama Anda"
        size="lg"
      />
      <DatePicker
        label="Tanggal"
        value={parseAbsoluteToLocal(data.tanggal) as any}
        onChange={handleDateChange}
        labelPlacement="outside"
      />
      <div className="flex gap-5">
        <Input
          label="Jumlah Orang"
          labelPlacement="outside"
          name="jumlahOrang"
          value={data.jumlah}
          onChange={(e) => setData({ ...data, jumlah: e.target.value })}
          placeholder="Masukan Jumlah Orang"
          size="lg"
          type="number"
        />
        <Input
          label="Nomor Handphone"
          pattern="[0-9]+"
          labelPlacement="outside"
          name="nomorHp"
          value={data.noHp}
          onChange={(e) => setData({ ...data, noHp: e.target.value })}
          placeholder="Nomor Handphone"
          size="lg"
        />
      </div>
      <Select
        label="Nomor Meja"
        labelPlacement="outside"
        name="noMeja"
        // defaultSelectedKeys={[data.noMeja]}
        selectedKeys={data.noMeja}
        onChange={() => handleSelectChange}
        placeholder="Nomor Meja"
        size="lg"
      >
        {meja.map((item: any) => (
          <SelectItem key={item.no_meja} textValue={item.no_meja}>
            Meja {item.no_meja}, Max {item.kapasitas}
          </SelectItem>
        ))}
      </Select>
    </>
  );
}
