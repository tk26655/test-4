"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) setStatus("error");
    else { setStatus("success"); setEmail(""); }
  };

  return (
    <div className="rounded-xl bg-gray-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900">Bądź na bieżąco</h3>
      <p className="mt-1 text-sm text-gray-500">Zapisz się, aby otrzymywać informacje o nowościach i promocjach.</p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input type="email" placeholder="twój@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none" />
        <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Zapisz się</button>
      </form>
      {status === "success" && <p className="mt-2 text-sm text-green-600">Dziękujemy za zapisanie się!</p>}
      {status === "error" && <p className="mt-2 text-sm text-red-500">Ten email jest już zapisany.</p>}
    </div>
  );
}