"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function ZapisanePage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("wishlist")
        .select("listing:listing_id(*, listing_images(url), profiles(username))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setItems(data.map((d: any) => d.listing));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Zapisane</h1>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item: any) => (
            <Link key={item.id} href={`/produkt/${item.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <Image src={item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80"} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="20vw" />
              </div>
              <p className="mt-1 font-medium text-gray-900">{item.price} zł</p>
              <p className="text-sm text-gray-500">{item.brand || "Bez marki"}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          <p>Nie masz jeszcze zapisanych produktów</p>
          <Link href="/" className="mt-2 inline-block text-sm text-black underline">Przeglądaj oferty</Link>
        </div>
      )}
    </div>
  );
}