"use client";
import TopContent from "@/components/top-content";
import SearchBar from "@/components/searchBar";
import Head from "@/components/head";
import { Button } from "@/components/Button";
import { useDisclosure } from "@heroui/react";
import Modal from "@/components/modal2";
import { useState } from "react";
import { Input } from "@heroui/react";
import fetchApi from "@/utils/fetchApi";
import { toast } from "react-toastify";
import SearchBar2 from "@/components/SearchBar2";
import FormKaryawan from "./formKaryawan";
import TableKaryawan from "./TableKaryawan";

export default function Page() {
  const modal = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      nama: formData.get("nama"),
      umur: formData.get("umur"),
      no_telp: formData.get("no_telp"),
      role: formData.get("role"),
    };

    const response = await fetchApi("/users", "POST", data);

    setLoading(false);
    modal.onClose();
    if (response.status === 400) return toast.error("GAGAL REGISTER");
    window.location.reload();

    return toast.success("BERHASIL REGISTER");
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      <TopContent />
      <Head>
        <Button onPress={modal.onOpen}>Tambah Karyawan</Button>
      </Head>
      <SearchBar2 setSearchQuery={setQuerySearch} />
      <Modal
        btnActionTitle="Simpan"
        isOpen={modal.isOpen}
        loading={loading}
        submit={handleSubmit}
        title="Tambah Karyawan"
        onOpenChange={modal.onOpenChange}
        sizeModal="xl"
      >
        <FormKaryawan />
      </Modal>
      <div className="flex overflow-hidden">
        <div className="flex-1  flex flex-row overflow-auto">
          <TableKaryawan querySearch={querySearch} />
        </div>
      </div>
    </div>
  );
}
