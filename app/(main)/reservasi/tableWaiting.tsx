"use client";

import Table from "@/components/table";
import React, { useEffect, useState } from "react";
import Modal from "@/components/modal2";
import { useDisclosure } from "@heroui/react";
import FormReservasi from "./formReservasi";
import fetchApi from "@/utils/fetchApi";
import { toast } from "react-toastify";
import { Loading } from "@/components/loading";

// interface EditDataWaiting {
//     id: number;
//     atasNama: string;
//     jumlah: number;
//     tanggal: Date;
//     idPelayan: number;
//     noHp: string;
//     status: string;
// }

export default function TableWaiting({ querySearch }: any) {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [idWaiting, setIdWaiting] = useState(0);
  const [editData, setEditData] = useState<any>();
  const modal = useDisclosure();
  const modal2 = useDisclosure();


  const columns = [
    { key: "atas_nama", label: "Atas Nama" },
    { key: "banyak_orang", label: "Jumlah Orang" },
    { key: "tanggal", label: "Tanggal Reservasi" },
    { key: "nama_pelayan", label: "Nama Pelayan" },
    { key: "no_telp", label: "Nomor Handphone" },
    { key: "action", label: "Action" },
  ];

  const getDataWaiting = async () => {
    setLoading(true);
    const { data } = await fetchApi("/reservasi", "GET");

    const filteredData = data.filter((item: any) => item.status === "waiting");

    setData(filteredData);
    setLoading(false);
  };

  const handleEdit = (id: string | number) => {
    const reservasiId = Number(id);
    console.log("Edit item with id:", reservasiId);
    const dataEdit = data.find((item: any) => Number(item.id) === reservasiId);

    if (dataEdit) {
      const mappedData = {
        id: reservasiId,
        atasNama: dataEdit.atas_nama,
        jumlah: dataEdit.banyak_orang.toString(),
        noHp: dataEdit.no_telp,
        noMeja: dataEdit.no_meja,
        tanggal: dataEdit.tanggal,
      };

      setEditData(mappedData);
    }
    modal.onOpen();
  };

  const handleDelete = (id: string | number) => {
    const reservasiId = Number(id);
    console.log("Delete item with id:", reservasiId);
    setIdWaiting(reservasiId);
    modal2.onOpen();
  };

  async function handleEditSubmit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      atasNama: formData.get("atasNama"),
      jumlahOrang: formData.get("jumlahOrang"),
      nomorHp: formData.get("nomorHp"),
      noMeja: formData.get("noMeja"),
      tanggal: formData.get("tanggal"),
    };

    setLoading(true);
    const response = await fetchApi(`/reservasi/${editData.id}`, "PUT", data);

    if (response.status == 201) toast.success("Berhasil update reservasi");
    else if (response.status == 400) toast.error(response.message);
    else toast.error("Gagal update reservasi");
    setLoading(false);
    if (response.status == 201) {
      modal.onClose();
      window.location.reload();
    }
  }

  const handleDeleteSubmit = async () => {
    setLoadingDelete(true);
    const response = await fetchApi(`/reservasi/${idWaiting}`, "DELETE");

    if (response.status !== 200) toast.error("Gagal menghapus Reservasi");
    else toast.success("Berhasil menghapus reservasi");
    setLoadingDelete(false);

    if (response.status == 200) {
      modal2.onClose();
      window.location.reload();
    }
  };

  useEffect(() => {
    getDataWaiting();
  }, []);

  useEffect(() => {
    const filteredData = data.filter((item: any) =>
      item.atas_nama.toLowerCase().includes(querySearch.toLowerCase())
    );

    setSearchData(filteredData);
  }, [querySearch]);

  return (
    <div className="w-full h-auto">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            columns={columns}
            data={querySearch == "" ? data : searchData}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <Modal
            btnActionTitle="Simpan"
            isOpen={modal.isOpen}
            loading={loading}
            submit={handleEditSubmit}
            title="Edit Reservasi"
            onOpenChange={modal.onOpenChange}
            sizeModal="xl"
          >
            <FormReservasi initialData={editData} />
          </Modal>
          <Modal
            isOpen={modal2.isOpen}
            onOpenChange={modal2.onOpenChange}
            btnActionTitle="Cancel Reservasi  "
            title="Cancel Reservasi"
            loading={loadingDelete}
            submit={handleDeleteSubmit}
          >
            <h1>Are you sure want to cancel this reservasi?</h1>
          </Modal>
        </>
      )}
    </div>
  );
}
