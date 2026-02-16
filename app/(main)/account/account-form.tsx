"use client";

import { useState } from "react";

import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { toast } from "react-toastify";

type AccountUser = {
  id: string;
  email: string | null;
  nama: string | null;
  umur: number | null;
  role: string | null;
  noTelp: string | null;
};

export default function AccountForm({ user }: { user: AccountUser }) {
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState<string>(user.nama ?? "");
  const [umur, setUmur] = useState<string>(user.umur?.toString() ?? "");
  const [noTelp, setNoTelp] = useState<string>(user.noTelp ?? "");

  async function updateProfile() {
    try {
      setLoading(true);

      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          umur: umur ? Number(umur) : null,
          no_telp: noTelp,
        }),
      });

      if (!response.ok) {
        throw new Error("failed update profile");
      }

      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Error updating profile!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-widget space-y-3">
      <Input disabled id="email" label="Email" type="text" value={user.email ?? ""} />
      <Input label="Nama" type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
      <Input label="Umur" type="number" value={umur} onChange={(e) => setUmur(e.target.value)} />
      <Input
        label="Nomor Telepon"
        type="text"
        value={noTelp}
        onChange={(e) => setNoTelp(e.target.value)}
      />
      <Input disabled label="Role" type="text" value={user.role ?? ""} />

      <Button className="button primary block" color="primary" disabled={loading} onClick={updateProfile}>
        {loading ? "Loading ..." : "Update"}
      </Button>

      <form action="/api/auth/logout" method="post">
        <Button className="button block" color="danger" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
