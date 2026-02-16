"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "./allContext";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/modal";
import fetchApi from "@/utils/fetchApi";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "react-toastify";
import { Loading } from "@/components/loading";
import { Button } from "@/components/Button";
interface userData {
  id: number;
}

interface Meja {
  no_meja: number;
  kapasitas: number;
  status: string;
}

export const OrderDetails = (): React.JSX.Element => {
  const { cart, dateTime, updateDateTime, emptyCart } = useCart();
  const [lastId, setLastID] = useState("");

  const [showMainModal, setShowMainModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [user, setUser] = useState<userData>();
  const [nama, setNama] = useState("");
  const [jumlahOrang, setJumlahOrang] = useState(1);
  const [noMeja, setNoMeja] = useState(0);
  const [mejaList, setMejaList] = useState<Meja[]>([]);
  const [idReservasi, setIdReservasi] = useState(0);
  const [loading, setLoading] = useState(false);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateDateTime(event.target.value);
  };

  const handleChangeNama = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNama(event.target.value);
  };

  const handleChangeJumlahOrang = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setJumlahOrang(Number(event.target.value));
  };

  // const handleChangeNoMeja = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setNoMeja(Number(event.target.value));
  // };

  const handleBayar = () => {
    if (!nama || jumlahOrang < 1) {
      setShowAlertModal(true);
    } else {
      setShowMainModal(true);
    }
  };

  const subTotal = cart.reduce(
    (sum, item) => sum + item.harga * item.quantity,
    0
  );
  const tax = subTotal * 0.05;
  const total = subTotal + tax;

  async function getLastId() {
    const { data } = await fetchApi("/pesanan/last", "GET");
    const newOrderId =
      data.length > 0
        ? `NT${String(data[0].id + 1).padStart(6, "0")}`
        : "NT000001";

    setLastID(newOrderId);
  }

  async function getUser() {
    const { data } = await fetchApi("/auth/current-user", "GET");

    setUser(data);
  }

  async function getMejaList() {
    const { data } = await fetchApi("/meja", "GET");

    const filteredData = data.filter((meja: Meja) => meja.status === 'Full');
    const sortedData = filteredData.sort((a: any, b: any) => a.no_meja - b.no_meja);


    setMejaList(sortedData);
  }

  async function handleMejaChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedMeja = Number(event.target.value);

    setNoMeja(selectedMeja);
    
    setLoading(true);
    const { data } = await fetchApi(`/meja/${selectedMeja}`, "GET");

    if (data.reservasi) {
      setNama(data.reservasi[0].atas_nama);
      setJumlahOrang(data.reservasi[0].banyak_orang);
      setIdReservasi(data.reservasi[0].id);
    }
    setLoading(false);
  }

  async function sendOrder() {
    const orderData = {
      idReservasi: idReservasi,
      atasNama: nama,
      banyak_orang: jumlahOrang,
      no_meja: noMeja,
      status: "ongoing",
      total_harga: total,
      items: cart.map((item) => ({
        id_menu: item.id,
        jumlah: item.quantity,
      })),
    };

    setLoading(true);
    const response = await fetchApi("/pesanan", "POST", orderData);

    if (response.status === 200) {
      handlerGetlastID();
      setLoading(false);
    } else {
      console.error("Failed to send order", response);
    }
  }

  function handlerGetlastID() {
    setShowMainModal(false);
    setNama("");
    setJumlahOrang(1);
    setNoMeja(0);
    emptyCart(cart);
    getLastId();
    toast.success("Pesanan Berhasil Dibuat");
  }

  useEffect(() => {
    getUser();
    getLastId();
    getMejaList();
  }, []);

  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <>
          <motion.div
            animate={{ x: 0 }}
            className="w-[420px] h-full relative"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col drop-shadow-lg h-full">
              <div className="bg-white mr-12 items-center justify-center rounded-t-lg py-4 px-6">
                <h1 className="font-bold text-2xl">Detail Pesanan</h1>
                <div className="flex flex-col gap-1 pt-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <h4>ID Pesanan</h4>
                    <input
                      disabled
                      className="text-end bg-white font-medium"
                      type="text"
                      value={lastId}
                    />
                  </div>
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <h4>Atas Nama</h4>
                        <input
                          disabled
                          className="text-end bg-white font-medium"
                          placeholder="Masukan Nama"
                          type="text"
                          value={nama}
                        />
                      </div>
                      <div className="flex justify-between">
                        <h4>Jumlah Orang</h4>
                        <input
                          disabled
                          className="text-end bg-white font-medium"
                          min={1}
                          placeholder="1"
                          type="number"
                          value={jumlahOrang}
                        />
                      </div>
                      <div className="flex justify-between">
                        <h4>Tanggal Pesanan</h4>
                        <input
                          disabled
                          className="text-end bg-white font-medium"
                          type="timestamp"
                          value={dateTime}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="flex justify-between">
                        <h4>ID Kasir</h4>
                        <input
                          disabled
                          className="text-end bg-white font-medium"
                          type="text"
                          value={user?.id.toString()}
                        />
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <h4>No Meja</h4>
                    <select
                      className="text-end bg-white font-medium"
                      value={noMeja}
                      onChange={handleMejaChange}
                    >
                      <option selected>-- Pilih Meja --</option>
                      {mejaList.map((meja) => (
                        <option key={meja.no_meja} value={meja.no_meja}>
                          {meja.no_meja}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col mt-2 lg:min-h-28 lg:max-h-20 2xl:max-h-64">
                  <h1 className="font-bold text-2xl">Produk</h1>
                  <div className="overflow-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-row gap-4 mt-4 text-gray-600"
                      >
                        <div className="flex border rounded-lg max-w-16 max-h-16">
                          <img
                            alt={item.nama}
                            className="rounded-lg"
                            src={item.foto}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h1 className="font-bold">{item.nama}</h1>
                          <h2 className="text-sm font-semibold">
                            Rp. {item.harga}
                          </h2>
                        </div>
                        <div className="flex flex-row items-center text-sm font-semibold">
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col bg-white mr-12 py-6 px-6 drop-shadow-md shadow-inner gap-1 rounded-b-lg text-gray-600">
                <div className="flex justify-between text-sm">
                  <h4>Sub Total</h4>
                  <h4 className="font-medium">{formatCurrency(subTotal)}</h4>
                </div>
                <div className="flex justify-between text-sm">
                  <h4>Tax (5%)</h4>
                  <h4 className="font-medium">{formatCurrency(tax)}</h4>
                </div>
                <div className="flex justify-between text-amber-900">
                  <h4>Total</h4>
                  <h4 className="font-bold">{formatCurrency(total)}</h4>
                </div>
                {/* <button
                  className="bg-amber-950 text-slate-50 py-3 px-5 w-full rounded-lg mt-4 hover:bg-amber-900 transition-all duration-300"
                  onClick={() => handleBayar()}
                >
                  Bayar
                </button> */}
                <Button
                  isLoading={loading}
                  onClick={()=> handleBayar()}
                  className="bg-amber-950 text-slate-50 py-3 px-5 w-full rounded-lg mt-4 hover:bg-amber-900 transition-all duration-300"
                >Bayar</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      {showAlertModal && (
        <Modal
          key={showAlertModal ? "show" : "hide"}
          closeModal={() => setShowAlertModal(false)}
          showModal={showAlertModal}
        >
          <h2 className="text-2xl font-bold mb-4">Alert</h2>
          <div className="w-full border-t-2 border-dashed border-gray-400 my-4" />
          <p>Silakan isi pilih meja dahulu.</p>
          <button
            className="bg-amber-950 text-slate-50 py-3 px-5 w-full rounded-lg mt-8 hover:bg-amber-900 transition-all duration-300"
            onClick={() => setShowAlertModal(false)}
          >
            Oke
          </button>
        </Modal>
      )}

      {showMainModal && (
        <Modal
          key={showMainModal ? "show" : "hide"}
          closeModal={() => setShowMainModal(false)}
          showModal={showMainModal}
        >
          <h2 className="text-2xl font-bold">Nota Pemesanan</h2>
          <div className="min-w-96 border-t-2 border-dashed border-gray-400 my-3" />
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <h4>No Pesanan</h4>
              <h4>#{lastId}</h4>
            </div>
            <div className="flex justify-between">
              <h4>Atas Nama</h4>
              <h4>{nama}</h4>
            </div>
            <div className="flex justify-between">
              <h4>Jumlah Orang</h4>
              <h4>{jumlahOrang}</h4>
            </div>
            <div className="flex justify-between">
              <h4>Tanggal Pesanan</h4>
              <h4>{dateTime}</h4>
            </div>
          </div>
          <div className="min-w-96 border-t-2 border-dashed border-gray-400 my-3" />
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <div className="flex justify-between w-full">
              <h4 className="w-1/3 text-start">No</h4>
              <h4 className="w-1/3 text-start">Menu</h4>
              <h4 className="w-1/3 text-center">Jumlah</h4>
              <h4 className="w-1/3 text-end">Harga</h4>
            </div>
            {cart.map((item, index) => (
              <div key={item.id} className="flex justify-between items-center">
                <h4 className="w-1/3 text-start">{index + 1}</h4>
                <h4 className="w-1/3 text-start">{item.nama}</h4>
                <h4 className="w-1/3 text-center">{item.quantity}</h4>
                <h4 className="w-1/3 text-end">{item.harga}</h4>
              </div>
            ))}
          </div>
          <div className="min-w-96 border-t-2 border-dashed border-gray-400 my-3" />
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <h4>Sub Total</h4>
              <h4>{formatCurrency(subTotal)}</h4>
            </div>
            <div className="flex justify-between">
              <h4>Pajak (5%)</h4>
              <h4>{formatCurrency(tax)}</h4>
            </div>
            <div className="flex justify-between">
              <h4>Total</h4>
              <h4>{formatCurrency(total)}</h4>
            </div>
          </div>
          <div className="min-w-96 border-t-2 border-dashed border-gray-400 my-3" />
          {/* <button
            className="bg-amber-950 text-slate-50 py-3 px-5 w-full rounded-lg mt-2 hover:bg-amber-900 transition-all duration-300"
            onClick={() => sendOrder()}
          >
            Cetak Nota
          </button> */}
          <Button
                  isLoading={loading}
                  onClick={()=> sendOrder()}
                  className="bg-amber-950 text-slate-50 py-3 px-5 w-full rounded-lg mt-4 hover:bg-amber-900 transition-all duration-300"
                >Cetak Nota</Button>
        </Modal>
      )}
    </AnimatePresence>
  );
};
