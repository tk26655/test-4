"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    brand: "",
    size: "",
    category: "kobiety",
    condition: "dobry",
    price: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Musisz być zalogowany"); setLoading(false); router.push("/login"); return; }

    const { data: listing, error: listingError } = await supabase.from("listings").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      brand: form.brand,
      size: form.size,
      category: form.category,
      condition: form.condition,
      price: parseFloat(form.price),
    }).select().single();

    if (listingError || !listing) { alert("Błąd: " + listingError?.message); setLoading(false); return; }

    // Upload images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${user.id}/${listing.id}/${Date.now()}_${i}.jpg`;
      const { error: uploadError } = await supabase.storage.from("listings").upload(path, file);
      if (uploadError) continue;
      const { data: { publicUrl } } = supabase.storage.from("listings").getPublicUrl(path);
      await supabase.from("listing_images").insert({ listing_id: listing.id, storage_path: path, url: publicUrl, display_order: i });
    }

    router.push(`/produkt/${listing.id}`);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dodaj ogłoszenie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Zdjęcia (max 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:text-white" />
          <div className="mt-2 flex gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                <img src={p} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <input required placeholder="Tytuł" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        <input placeholder="Marka" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="Rozmiar (np. M, 42)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
          <input required type="number" placeholder="Cena (zł)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black">
            <option value="kobiety">Kobiety</option>
            <option value="mezczyzni">Mężczyźni</option>
            <option value="dzieci">Dzieci</option>
            <option value="dom">Dom</option>
            <option value="akcesoria">Akcesoria</option>
          </select>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black">
            <option value="nowe">Nowe z metką</option>
            <option value="jak_nowe">Jak nowe</option>
            <option value="dobry">Dobry stan</option>
            <option value="zadowalajacy">Zadowalający</option>
          </select>
        </div>
        <textarea placeholder="Opis" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Dodawanie..." : "Opublikuj ogłoszenie"}
        </button>
      </form>
    </div>
  );
}