"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

const statusLabels: Record<string, string> = {
  pending: "Oczekujące", paid: "Opłacone", shipped: "Wysłane",
  delivered: "Dostarczone", cancelled: "Anulowane", refunded: "Zwrot",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700", refunded: "bg-gray-100 text-gray-700",
};

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [tab, setTab] = useState<"buying" | "selling">("buying");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: buying }, { data: selling }] = await Promise.all([
        supabase.from("orders").select("*, seller:profiles!seller_id(username)").eq("buyer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("orders").select("*, buyer:profiles!buyer_id(username)").eq("seller_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (buying) setOrders(buying);
      if (selling) setSales(selling);
      setLoading(false);
    };
    fetchData();
  }, []);

  const data = tab === "buying" ? orders : sales;
  const label = tab === "buying" ? "Moje zakupy" : "Moja sprzedaż";

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Zamówienia</h1>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab("buying")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === "buying" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>Kupuję ({orders.length})</button>
        <button onClick={() => setTab("selling")} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === "selling" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}>Sprzedaję ({sales.length})</button>
      </div>

      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((o: any) => (
            <Link key={o.id} href={`/zamowienia/${o.id}`} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
              {o.listing_image && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image src={o.listing_image} alt={o.listing_title} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-900">{o.listing_title}</p>
                <p className="text-sm text-gray-500">{o.listing_price} zł · {tab === "buying" ? o.seller?.username : o.buyer?.username}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          <p>Brak zamówień</p>
        </div>
      )}
    </div>
  );
}