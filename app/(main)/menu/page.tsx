"use client";
import TopContent from "@/components/top-content";
import TableMenu from "./TableMenu";
import Head from "@/components/head";
import { Button } from "@/components/Button";
import Modal from "@/components/modal2";
import { useDisclosure } from "@heroui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import FormMenu from "./formMenu";

export default function Page() {
  const modal = useDisclosure();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

    setLoading(true);
    const response = await fetch("/api/menu", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    modal.onClose();
    if (!response.ok) toast.error("Gagal menambahkan Menu");
    else toast.success("Berhasil menambahkan Menu");
    window.location.reload();
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      <TopContent />
      {/* <TableMenu /> */}
      <Head>
        <Button onPress={modal.onOpen}>Tambah Menu</Button>
      </Head>
      <Modal
        btnActionTitle="Simpan"
        isOpen={modal.isOpen}
        loading={loading}
        submit={handleSubmit}
        title="Tambah Menu"
        onOpenChange={modal.onOpenChange}
        sizeModal="xl"
      >
        <FormMenu />
      </Modal>
      <div className="flex overflow-hidden">
        <div className="flex-1  flex flex-row overflow-auto">
          <TableMenu />
        </div>
      </div>
    </div>
  );
}
