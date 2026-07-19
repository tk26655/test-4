"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });

    const data = await res.json();
    if (data.valid) {
      document.cookie = `vintera_invite=${code.trim().toUpperCase()};path=/;max-age=2592000`;
      router.push("/");
      router.refresh();
    } else {
      setError("Nieprawidłowy lub wykorzystany kod zaproszenia");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vintera</h1>
        <p className="text-sm text-gray-600">Platforma w zamkniętej becie. Wpisz kod zaproszenia, aby wejść.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="TWÓJ-KOD"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-medium tracking-widest uppercase focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sprawdzanie..." : "Wejdź"}
          </button>
        </form>
        <p className="text-xs text-gray-400">Beta prywatna. Tylko zaproszeni użytkownicy.</p>
      </div>
    </div>
  );
}