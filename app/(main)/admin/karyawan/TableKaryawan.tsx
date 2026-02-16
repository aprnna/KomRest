"use client";
import { useEffect, useState } from "react";
import fetchApi from "@/utils/fetchApi";
import Table from "@/components/table";
import { Loading } from "@/components/loading";
import { toast } from "react-toastify";
import Modal from "@/components/modal2";
import { useDisclosure } from "@heroui/react";
import FormKaryawan from "./formKaryawan";

interface EditData {
  id: string;
  nama: string;
  umur: number;
  no_telp: string;
  role: string;
}

export default function TableKaryawan({ querySearch }: any) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [idusers, setIdusers] = useState("");
  const [editData, setEditData] = useState<EditData>({
    id: "",
    nama: "",
    umur: 0,
    no_telp: "",
    role: "",
  });
  const [searchData, setSearchData] = useState([]);
  const modal = useDisclosure();
  const modal2 = useDisclosure();

  async function getUsers() {
    setLoading(true);
    const { data } = await fetchApi("/users", "GET");

    setUsers(data);
    setLoading(false);
  }

  const handleEdit = (id: string | number) => {
    const userId = String(id);
    console.log("Edit item with id:", userId);
    const data = users.find((item: any) => item.id === userId);

    if (data) setEditData(data);
    modal.onOpen();
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const formData = new FormData(e.target);
    const dataUpdate = {
      nama: formData.get("nama"),
      umur: formData.get("umur"),
      no_telp: formData.get("no_telp"),
      role: formData.get("role"),
    };
    const response = await fetchApi(`/users/${editData.id}`, "PUT", dataUpdate);

    setLoadingUpdate(false);
    modal.onClose();
    if (response.status !== 200) {
      return toast.error("Gagal mengedit users baku");
    }
    toast.success("Berhasil mengedit users baku");
    window.location.reload();
  };
  const handleDelete = (id: string | number) => {
    const userId = String(id);
    console.log("Delete item with id:", userId);
    setIdusers(userId);
    modal2.onOpen();
  };
  const handleDeleteSubmit = async () => {
    setLoadingDelete(true);
    const response = await fetchApi(`/users/${idusers}`, "DELETE");

    modal2.onClose();
    setLoadingDelete(false);

    if (response.status !== 200) return toast.error("Gagal menghapus users");
    toast.success("Berhasil menghapus users");
    window.location.reload();
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    const filteredData = users.filter((item: any) =>
      item.nama.toLowerCase().includes(querySearch.toLowerCase())
    );

    setSearchData(filteredData);
  }, [querySearch]);

  const columns = [
    { key: "nama", label: "Nama karyawan" },
    { key: "umur", label: "Umur" },
    { key: "no_telp", label: "Nomor Telp" },
    { key: "role", label: "Jabatan" },
    { key: "createdAt", label: "Tanggal" },
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
            data={querySearch == "" ? users : searchData}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          <Modal
            btnActionTitle="Edit Karyawan"
            isOpen={modal.isOpen}
            loading={loadingUpdate}
            submit={handleEditSubmit}
            title="Edit Karyawan"
            onOpenChange={modal.onOpenChange}
            sizeModal="xl"
          >
            <FormKaryawan initialData={editData} isEdit={true} />
          </Modal>
          <Modal
            isOpen={modal2.isOpen}
            onOpenChange={modal2.onOpenChange}
            btnActionTitle="Delete"
            title="Delete Karyawan"
            loading={loadingDelete}
            submit={handleDeleteSubmit}
          >
            <h1>Are you sure want to delete this karyawan?</h1>
          </Modal>
        </>
      )}
    </div>
  );
}
