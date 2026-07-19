"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const statusLabels: Record<string, string> = {
  pending: "Oczekujące",
  paid: "Opłacone",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
  refunded: "Zwrot",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const success = searchParams.get("success");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("orders").select("*, buyer:profiles!buyer_id(username), seller:profiles!seller_id(username)").eq("id", params.id).single();
      if (data) {
        setOrder(data);
        setIsSeller(data.seller_id === user.id);
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", params.id);
    setOrder({ ...order, status: newStatus });
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;
  if (!order) return <div className="py-20 text-center text-gray-400">Nie znaleziono zamówienia</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm text-green-700">
          Zamówienie zostało złożone pomyślnie!
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Zamówienie #{order.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
      </div>

      {/* Product */}
      <div className="mb-6 flex gap-4 rounded-xl border border-gray-200 p-4">
        {order.listing_image && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image src={order.listing_image} alt={order.listing_title} fill className="object-cover" sizes="80px" />
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{order.listing_title}</p>
          <p className="text-lg font-bold text-gray-900">{order.listing_price} zł</p>
        </div>
      </div>

      {/* Shipping */}
      <div className="mb-6 rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Dane dostawy</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-900">{order.buyer_name}</span></p>
          <p>{order.buyer_email}</p>
          {order.buyer_phone && <p>{order.buyer_phone}</p>}
          <p className="mt-2">{order.shipping_address}</p>
          <p>{order.shipping_postal} {order.shipping_city}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Kupujący</p>
          <p className="font-medium text-gray-900">{order.buyer?.username || "Użytkownik"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Sprzedający</p>
          <p className="font-medium text-gray-900">{order.seller?.username || "Użytkownik"}</p>
        </div>
      </div>

      {/* Seller actions */}
      {isSeller && (
        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Akcje sprzedającego</h3>
          <div className="flex flex-wrap gap-2">
            {order.status === "pending" && (
              <button onClick={() => updateStatus("paid")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Oznacz jako opłacone</button>
            )}
            {order.status === "paid" && (
              <>
                <input placeholder="Numer przesyłki" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <button onClick={() => updateStatus("shipped")} className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">Oznacz jako wysłane</button>
              </>
            )}
            {order.status === "shipped" && (
              <button onClick={() => updateStatus("delivered")} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Oznacz jako dostarczone</button>
            )}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button onClick={() => updateStatus("cancelled")} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Anuluj zamówienie</button>
            )}
          </div>
        </div>
      )}

      <Link href="/zamowienia" className="text-sm text-gray-500 underline hover:text-black">← Wróć do listy zamówień</Link>
    </div>
  );
}