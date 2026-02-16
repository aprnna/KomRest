"use client";
import { useEffect, useState } from "react";
import fetchApi from "@/utils/fetchApi";
import Table from "@/components/table";
import { Loading } from "@/components/loading";
import { toast } from "react-toastify";
import Modal from "@/components/modal2";
import { useDisclosure } from "@heroui/react";
import FormMenu from "./formMenu";

interface EditData {
  id: number;
  nama: string;
  harga: number;
  kategori: string;
  foto?: File;
}

export default function TableMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const modal = useDisclosure();
  const modalUpdate = useDisclosure();
  const [idMenu, setIdMenu] = useState(0);
  const [editData, setEditData] = useState<EditData>({
    id: 0,
    nama: "",
    harga: 0,
    kategori: "",
  });

  async function getMenu() {
    setLoading(true);
    const { data } = await fetchApi("/menu", "GET");

    setMenu(data);
    setLoading(false);
  }

  const handleEdit = (id: string | number) => {
    const menuId = Number(id);
    console.log("Edit item with id:", menuId);
    // Tambahkan logika untuk mengedit item
    const data = menu.find((item: any) => Number(item.id) === menuId);

    if (data) setEditData(data);
    modalUpdate.onOpen();
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const formData = new FormData(e.target);

    formData.append("oldFoto", editData.foto as any);
    const response = await fetch(`/api/menu/${editData.id}`, {
      method: "PUT",
      body: formData,
    });

    setLoadingUpdate(false);
    modalUpdate.onClose();

    if (!response.ok) toast.error("Gagal menambahkan Menu");
    else toast.success("Berhasil menambahkan Menu");
    window.location.reload();
  };

  const handleDelete = (id: string | number) => {
    const menuId = Number(id);
    console.log("Delete item with id:", menuId);
    setIdMenu(menuId);
    modal.onOpen();
  };

  const handleDeleteSubmit = async (e: any) => {
    e.preventDefault();
    setLoadingDelete(true);
    const response = await fetchApi(`/menu/${idMenu}`, "DELETE");

    setLoadingDelete(false);
    modal.onClose();
    if (response.status !== 200) toast.error("Gagal menghapus Menu");
    else toast.success("Berhasil menghapus Menu");
    window.location.reload();
  };

  useEffect(() => {
    getMenu();
  }, []);

  const columns = [
    { key: "nama", label: "Nama Makanan" },
    { key: "harga", label: "Harga" },
    { key: "kategori", label: "Kategori" },
    { key: "tersedia", label: "Tersedia" },
    { key: "action", label: "Action" },
  ];

  return (
    <div className="w-full h-auto">
      {/* <h1 className="text-2xl font-bold">Menu</h1> */}
      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={menu}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      <Modal
        btnActionTitle="Edit Menu"
        isOpen={modalUpdate.isOpen}
        loading={loadingUpdate}
        submit={handleEditSubmit}
        title="Edit Menu"
        onOpenChange={modalUpdate.onOpenChange}
        sizeModal="xl"
      >
        <FormMenu initialData={editData} />
      </Modal>
      <Modal
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        btnActionTitle="Delete"
        title="Delete Menu"
        loading={loadingDelete}
        submit={handleDeleteSubmit}
      >
        <h1>Are you sure want to delete this menu?</h1>
      </Modal>
    </div>
  );
}
