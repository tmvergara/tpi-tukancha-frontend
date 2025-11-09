"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data?.message || "Error al registrar");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm p-6 rounded shadow">
        <h2 className="text-2xl mb-4">Crear cuenta</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block mb-2">
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full"
            type="email"
            required
          />
        </label>
        <label className="block mb-4">
          <span>Contraseña</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full"
            type="password"
            required
          />
        </label>
        <button
          className="w-full rounded bg-foreground text-background py-2"
          type="submit"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
