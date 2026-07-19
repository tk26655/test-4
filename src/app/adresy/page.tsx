"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddressesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", postal: "" });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase.from("saved_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    if (data) setAddresses(data);
    setLoading(false);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editing) {
      await supabase.from("saved_addresses").update(form).eq("id", editing);
    } else {
      await supabase.from("saved_addresses").insert({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    }
    setForm({ name: "", email: "", phone: "", address: "", city: "", postal: "" });
    setEditing(null);
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Na pewno usunąć ten adres?")) return;
    await supabase.from("saved_addresses").delete().eq("id", id);
    fetchAddresses();
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    fetchAddresses();
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Moje adresy</h1>

      <form onSubmit={saveAddress} className="mb-8 space-y-3 rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">{editing ? "Edytuj adres" : "Dodaj nowy adres"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Imię i nazwisko" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Ulica i numer" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Kod pocztowy" value={form.postal} onChange={(e) => setForm({...form, postal: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required placeholder="Miasto" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">{editing ? "Zapisz zmiany" : "Dodaj adres"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", email: "", phone: "", address: "", city: "", postal: "" }); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600">Anuluj</button>}
        </div>
      </form>

      <div className="space-y-3">
        {addresses.map((addr: any) => (
          <div key={addr.id} className="flex items-start justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{addr.name}</span>
                {addr.is_default && <span className="rounded bg-black px-2 py-0.5 text-xs text-white">Domyślny</span>}
              </div>
              <p className="text-sm text-gray-500">{addr.email}</p>
              <p className="text-sm text-gray-500">{addr.address}, {addr.postal} {addr.city}</p>
            </div>
            <div className="flex gap-2">
              {!addr.is_default && (
                <button onClick={() => setDefault(addr.id)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Ustaw domyślny</button>
              )}
              <button onClick={() => { setEditing(addr.id); setForm(addr); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Edytuj</button>
              <button onClick={() => deleteAddress(addr.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Usuń</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}