"use client";

import TopContent from "@/components/top-content";
import Head from "@/components/head";
import React from "react";
import { useEffect, useState } from "react";
import fetchApi from "@/utils/fetchApi";
import TablePemasukan from "./TablePemasukan";
import { formatCurrency } from "@/utils/formatCurrency";
import { RangeCalendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";

interface Data {
  profit: number;
  banyakPelanggan: number;
  rataRataPesananSelesaiDalamJam: number;
}

export default function Page() {
  const [data, setData] = useState<Data>({
    profit: 0,
    banyakPelanggan: 0,
    rataRataPesananSelesaiDalamJam: 0,
  });
  const [loading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState("");

  let [value, setValue] = useState<RangeValue<DateValue>>({
    start: today(getLocalTimeZone()).add({ weeks: -1 }) as any,
    end: today(getLocalTimeZone()).add({ weeks: 1 }) as any,
  });

  async function getData() {
    setLoading(true);
    const { data } = await fetchApi("/pesanan/profit", "POST", {
      start: value.start.toString(),
      end: value.end.toString(),
    });

    setData(data);
    setLoading(false);
  }
  useEffect(() => {
    getData();
  }, [value.end]);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col">
      <TopContent />
      <Head />
      <div className="flex overflow-hidden">
        <div className="flex-1  flex flex-col overflow-auto">
          <section className="flex w-full gap-5 justify-center my-4 px-14">
            <div className="flex justify-center gap-5 h-fit">
              <RangeCalendar
                aria-label="Date (Controlled)"
                value={value}
                onChange={setValue}
              />
            </div>
            <div className="">
              <div className="flex mx-12 gap-5 h-fit flex-wrap justify-center">
                <div className="rounded-lg p-4 px-8 flex-1 bg-amber-900 text-slate-50">
                  <h1 className="text-foreground-200">Penghasilan</h1>
                  <h1 className="text-lg font-bold">
                    {loading ? "loading..." : formatCurrency(data?.profit)}
                  </h1>
                </div>
                <div className="rounded-lg p-4 px-8 bg-amber-900 text-slate-50">
                  <h1 className="text-foreground-200">Banyak Pelanggan</h1>
                  <h1 className="text-lg font-bold">
                    {loading ? "loading..." : data?.banyakPelanggan + " Orang"}
                  </h1>
                </div>
                <div className="rounded-lg p-4 px-8 bg-amber-900 text-slate-50">
                  <h1 className="text-foreground-200">
                    Rata-Rata Pesanan Selesai
                  </h1>
                  <h1 className="text-lg font-bold">
                    {loading
                      ? "loading..."
                      : data?.rataRataPesananSelesaiDalamJam?.toFixed(2) +
                        " jam"}
                  </h1>
                </div>
              </div>
              <TablePemasukan />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
