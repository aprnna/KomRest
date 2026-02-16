"use client";

import React, { useState } from "react";
import ToggleSwitch from "@/components/toggleSwitch";
import fetchApi from "@/utils/fetchApi";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

function formatID(id: number): string {
  const prefix = "NT";
  const paddedID = id.toString().padStart(6, "0");

  return `${prefix}${paddedID}`;
}

function formatToDateTimeLocal(timestamp: string) {
  const parts = timestamp.split("T");

  const datePart = parts[0].split("-");
  const year = datePart[0];
  const month = datePart[1];
  const day = datePart[2];

  const timePart = parts[1].split(".")[0].split(":");

  const hour = timePart[0];
  const minute = timePart[1];
  const second = timePart[2];

  const formattedDateTimeLocal = `${day}-${month}-${year} ${hour}:${minute}:${second}`;

  console.log(formattedDateTimeLocal);

  return formattedDateTimeLocal;
}

const Table: React.FC<TableProps> = ({ columns, data, onEdit, onDelete }) => {
  const [statuses, setStatuses] = useState(data.map((item) => item.tersedia));
  const handleToggle = async (index: number, dataId: any) => {
    const newStatuses = [...statuses];
    const response = await toast.promise(
      fetchApi(`/menu/change-status/${dataId}`, "PUT"),
      {
        pending: "Change status menu...",
        success: "Berhasil mengubah status",
        error: "Gagal mengubah status",
      }
    );

    newStatuses[index] = !newStatuses[index];
    setStatuses(newStatuses);
  };

  return (
    <div className="overflow-x-auto px-12 pb-4">
      <table className="min-w-full border-separate border-spacing-0 border-spacing-y-2">
        <thead className="bg-amber-900">
          <tr>
            <td className="px-6 py-3 text-center text-sm font-medium text-slate-50 tracking-wider border-b-2 border-gray-200 rounded-tl-xl rounded-bl-xl normal-case">
              No.
            </td>
            {columns.map((column, index) => (
              <td
                key={column.key}
                className={`px-6 py-3 text-center text-sm font-medium text-slate-50 normal-case tracking-wider border-b-2 border-gray-200 ${
                  index === columns.length - 1
                    ? "rounded-tr-xl rounded-br-xl"
                    : ""
                }`}
              >
                {column.label}
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length == 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-4 text-sm font-medium text-gray-900"
              >
                No data
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-red-100">
                <td
                  className={`px-6 py-3 text-center whitespace-nowrap text-xs font-medium text-gray-900 border-b border-gray-200 rounded-tl-xl rounded-bl-xl`}
                >
                  {rowIndex + 1}
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={`px-6 py-2 whitespace-nowrap text-center text-xs font-medium text-gray-900 border-b border-gray-200 ${
                      colIndex === columns.length - 1
                        ? "rounded-tr-xl rounded-br-xl"
                        : ""
                    }`}
                  >
                    {column.key === "action" ? (
                      <div className="flex w-full justify-center gap-2">
                        <button
                          className="bg-red-100 p-1 rounded-lg fill-amber-950 hover:bg-amber-950 hover:fill-red-100 transition-all duration-300"
                          onClick={() => onEdit!(row.id)}
                        >
                          <svg
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M16 2H8C4 2 2 4 2 8V21C2 21.55 2.45 22 3 22H16C20 22 22 20 22 16V8C22 4 20 2 16 2ZM11.11 16.66C10.86 16.91 10.4 17.14 10.06 17.19L7.98 17.48C7.9 17.49 7.82 17.5 7.75 17.5C7.4 17.5 7.08 17.38 6.85 17.15C6.57 16.87 6.45 16.46 6.52 16.02L6.81 13.94C6.86 13.6 7.09 13.13 7.34 12.89L11.11 9.12C11.17 9.3 11.25 9.48 11.34 9.68C11.43 9.86 11.52 10.04 11.62 10.21C11.7 10.35 11.79 10.49 11.87 10.59C11.97 10.74 12.07 10.87 12.14 10.94C12.18 11 12.22 11.04 12.23 11.06C12.45 11.31 12.68 11.55 12.9 11.73C12.96 11.79 13 11.82 13.01 11.83C13.14 11.93 13.26 12.04 13.38 12.11C13.51 12.21 13.65 12.3 13.79 12.38C13.96 12.48 14.14 12.58 14.33 12.67C14.52 12.76 14.7 12.83 14.88 12.89L11.11 16.66ZM16.55 11.23L15.77 12.01C15.72 12.06 15.65 12.09 15.58 12.09C15.56 12.09 15.52 12.09 15.5 12.08C13.78 11.59 12.41 10.22 11.92 8.5C11.89 8.41 11.92 8.31 11.99 8.24L12.78 7.45C14.07 6.16 15.29 6.19 16.55 7.45C17.19 8.09 17.51 8.71 17.5 9.35C17.5 9.98 17.19 10.59 16.55 11.23Z" />
                          </svg>
                        </button>
                        <button
                          className="bg-red-100 p-1 rounded-lg fill-amber-950 hover:bg-amber-950 hover:fill-red-100 transition-all duration-300"
                          onClick={() => onDelete!(row.id)}
                        >
                          <svg
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M21.0699 5.23C19.4599 5.07 17.8499 4.95 16.2299 4.86V4.85L16.0099 3.55C15.8599 2.63 15.6399 1.25 13.2999 1.25H10.6799C8.34991 1.25 8.12991 2.57 7.96991 3.54L7.75991 4.82C6.82991 4.88 5.89991 4.94 4.96991 5.03L2.92991 5.23C2.50991 5.27 2.20991 5.64 2.24991 6.05C2.28991 6.46 2.64991 6.76 3.06991 6.72L5.10991 6.52C10.3499 6 15.6299 6.2 20.9299 6.73C20.9599 6.73 20.9799 6.73 21.0099 6.73C21.3899 6.73 21.7199 6.44 21.7599 6.05C21.7899 5.64 21.4899 5.27 21.0699 5.23Z" />
                            <path d="M19.23 8.14C18.99 7.89 18.66 7.75 18.32 7.75H5.67999C5.33999 7.75 4.99999 7.89 4.76999 8.14C4.53999 8.39 4.40999 8.73 4.42999 9.08L5.04999 19.34C5.15999 20.86 5.29999 22.76 8.78999 22.76H15.21C18.7 22.76 18.84 20.87 18.95 19.34L19.57 9.09C19.59 8.73 19.46 8.39 19.23 8.14ZM13.66 17.75H10.33C9.91999 17.75 9.57999 17.41 9.57999 17C9.57999 16.59 9.91999 16.25 10.33 16.25H13.66C14.07 16.25 14.41 16.59 14.41 17C14.41 17.41 14.07 17.75 13.66 17.75ZM14.5 13.75H9.49999C9.08999 13.75 8.74999 13.41 8.74999 13C8.74999 12.59 9.08999 12.25 9.49999 12.25H14.5C14.91 12.25 15.25 12.59 15.25 13C15.25 13.41 14.91 13.75 14.5 13.75Z" />
                          </svg>
                        </button>
                      </div>
                    ) : column.key === "id" ? (
                      formatID(row[column.key])
                    ) : column.key === "createdAt" ||
                      column.key === "tanggal" ? (
                      formatToDateTimeLocal(row[column.key])
                    ) : column.key === "total_harga" ? (
                      formatCurrency(row[column.key])
                    ) : column.key === "tersedia" ? (
                      <ToggleSwitch
                        initialChecked={statuses[rowIndex]}
                        onChange={() => handleToggle(rowIndex, row.id)}
                      />
                    ) : (
                      row[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
