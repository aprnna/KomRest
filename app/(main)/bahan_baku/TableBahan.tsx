"use client";
import { useEffect, useState } from "react";
import fetchApi from "@/utils/fetchApi";
import Table from "@/components/table";
import { Loading } from "@/components/loading";
import { toast } from "react-toastify";
import Modal from "@/components/modal2";
import FormBahan from "./formBahan";
import { useDisclosure } from "@heroui/react";

interface EditData {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string;
}

export default function TableBahan({ querySearch }: any) {
  const [bahan, setBahan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [idBahan, setIdBahan] = useState(0);
  const [editData, setEditData] = useState<EditData>({
    id: 0,
    nama: "",
    jumlah: 0,
    satuan: "",
  });
  const [searchData, setSearchData] = useState([]);
  const modal = useDisclosure();
  const modal2 = useDisclosure();

  async function getBahan() {
    setLoading(true);
    const { data } = await fetchApi("/bahan", "GET");

    setBahan(data);
    setLoading(false);
  }

  const handleEdit = (id: string | number) => {
    const bahanId = Number(id);
    console.log("Edit item with id:", bahanId);
    const data = bahan.find((item: any) => Number(item.id) === bahanId);

    if (data) setEditData(data);
    modal.onOpen();
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const formData = new FormData(e.target);
    const dataUpdate = {
      nama: formData.get("nama"),
      jumlah: formData.get("jumlah"),
      satuan: formData.get("satuan"),
    };
    const response = await fetchApi(`/bahan/${editData.id}`, "PUT", dataUpdate);

    if (response.status == 200) toast.success("Berhasil mengedit bahan baku");
    else toast.error("Gagal mengedit bahan baku");
    setLoadingUpdate(false);
    window.location.reload();
  };
  const handleDelete = (id: string | number) => {
    const bahanId = Number(id);
    console.log("Delete item with id:", bahanId);
    setIdBahan(bahanId);
    modal2.onOpen();
  };
  const handleDeleteSubmit = async () => {
    setLoadingDelete(true);
    const response = await fetchApi(`/bahan/${idBahan}`, "DELETE");

    if (response.status !== 200) toast.error("Gagal menghapus Bahan");
    else toast.success("Berhasil menghapus Bahan");
    modal2.onClose();
    setLoadingDelete(false);
    window.location.reload();
  };

  useEffect(() => {
    getBahan();
  }, []);

  useEffect(() => {
    const filteredData = bahan.filter((item: any) =>
      item.nama.toLowerCase().includes(querySearch.toLowerCase())
    );

    setSearchData(filteredData);
  }, [querySearch]);

  const columns = [
    { key: "nama", label: "Nama Bahan" },
    { key: "jumlah", label: "Jumlah" },
    { key: "satuan", label: "Satuan" },
    { key: "action", label: "Action" },
  ];

  return (
    <div className="w-full h-auto">
      {/* <h1 className="text-2xl font-bold">Menu</h1> */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            columns={columns}
            data={querySearch == "" ? bahan : searchData}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <Modal
            btnActionTitle="Edit Bahan Baku"
            isOpen={modal.isOpen}
            loading={loadingUpdate}
            submit={handleEditSubmit}
            title="Edit Bahan Baku"
            onOpenChange={modal.onOpenChange}
            sizeModal="xl"
          >
            <FormBahan initialData={editData} />
          </Modal>
          <Modal
            isOpen={modal2.isOpen}
            onOpenChange={modal2.onOpenChange}
            btnActionTitle="Delete"
            title="Delete Menu"
            loading={loadingDelete}
            submit={handleDeleteSubmit}
          >
            <h1>Are you sure want to delete this menu?</h1>
          </Modal>
        </>
      )}
    </div>
  );
}
