"use client";
import TopContent from "@/components/top-content";
import SearchBar from "@/components/searchBar";
import Head from "@/components/head";
import TableBahan from "./TableBahan";
import { Button } from "@/components/Button";
import { useDisclosure } from "@heroui/react";
import Modal from "@/components/modal2";
import { useState } from "react";
import { Input } from "@heroui/react";
import FormBahan from "./formBahan";
import fetchApi from "@/utils/fetchApi";
import { toast } from "react-toastify";
import SearchBar2 from "@/components/SearchBar2";

export default function Page() {
  const modal = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nama: formData.get("nama"),
      jumlah: formData.get("jumlah"),
      satuan: formData.get("satuan"),
    };

    setLoading(true);
    const response = await fetchApi("/bahan", "POST", data);

    if (response.status == 201)
      toast.success("Berhasil menambahkan bahan baku");
    else toast.error("Gagal menambahkan bahan baku");
    setLoading(false);
    modal.onClose();
    window.location.reload();
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      <TopContent />
      <Head>
        <Button as={"a"} href="/bahan_baku/riwayat">
          Riwayat Bahan Baku
        </Button>
        <Button onPress={modal.onOpen}>Tambah Bahan Baku</Button>
      </Head>
      <Modal
        btnActionTitle="Tambah Bahan Baku"
        isOpen={modal.isOpen}
        loading={loading}
        submit={handleSubmit}
        title="Penambahan Bahan Baku"
        onOpenChange={modal.onOpenChange}
        sizeModal="xl"
      >
        <FormBahan />
      </Modal>
      <SearchBar2 setSearchQuery={setQuerySearch} />
      <div className="flex overflow-hidden">
        <div className="flex-1  flex flex-row overflow-auto">
          <TableBahan querySearch={querySearch} />
        </div>
      </div>
    </div>
  );
}
