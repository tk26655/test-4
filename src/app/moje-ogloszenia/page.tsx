"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyListingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("listings").select("*, listing_images(url)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setListings(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const deleteListing = async (id: string) => {
    if (!confirm("Na pewno chcesz usunąć to ogłoszenie?")) return;
    await supabase.from("listings").update({ status: "deleted" }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Moje ogłoszenia</h1>
        <Link href="/dodaj" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">+ Nowe ogłoszenie</Link>
      </div>

      {listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image src={item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80"} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/produkt/${item.id}`} className="font-medium text-gray-900 hover:underline">{item.title}</Link>
                <p className="text-sm text-gray-500">{item.price} zł · {item.status === "active" ? "Aktywne" : "Nieaktywne"}</p>
                <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("pl-PL")}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/produkt/${item.id}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Podgląd</Link>
                <button onClick={() => deleteListing(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Usuń</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          <p>Nie masz jeszcze ogłoszeń</p>
          <Link href="/dodaj" className="mt-2 inline-block text-sm text-black underline">Dodaj pierwsze ogłoszenie</Link>
        </div>
      )}
    </div>
  );
}