"use client";
import { Input } from "@heroui/react";
import { title } from "@/components/primitives";
import { Button } from "@/components/Button";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    if (response.redirected) {
      toast.success("Login success");
      window.location.href = response.url;
    } else {
      const result = await response.json();

      toast.error("Login failed");
      console.error("Login failed:", result.error);
    }
  };

  return (
    <div className="grid grid-cols-2 p-4">
      <div>
        <img alt="loginImg" src="/loginImg.png" />
      </div>
      <div className="flex justify-center items-center">
        <div className="max-w-md w-full space-y-5">
          <h1 className={title({ color: "coklat" })}>Silahkan Login</h1>
          <hr className="h-1 bg-black" />
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              required
              id="email"
              label="Email"
              name="email"
              type="email"
            />
            <Input
              required
              id="password"
              label="Password"
              name="password"
              type="password"
            />
            <Button
              isLoading={loading}
              className="w-full"
              color="primary"
              type="submit"
            >
              Log in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
