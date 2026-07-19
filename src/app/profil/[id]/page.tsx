import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single();
  if (!profile) return notFound();

  const { data: listings } = await supabase.from("listings").select("*, listing_images(url)").eq("user_id", params.id).eq("status", "active").order("created_at", { ascending: false });
  const { data: reviews } = await supabase.from("reviews").select("*, reviewer:profiles!reviewer_id(username)").eq("reviewee_id", params.id).order("created_at", { ascending: false }).limit(5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-600">
          {(profile.username || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.boutique_name || profile.username}</h1>
          <p className="text-sm text-gray-500">{profile.location || "Katowice, Śląsk"}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium">⭐ {profile.rating || 5.0}</span>
            <span className="text-sm text-gray-400">· {profile.transactions_count || 0} transakcji</span>
            {profile.is_boutique && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Butik</span>}
            {profile.boutique_verified && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Zweryfikowany</span>}
          </div>
          {profile.boutique_description && <p className="mt-2 text-sm text-gray-600">{profile.boutique_description}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <span className="border-b-2 border-black px-4 py-2 text-sm font-medium text-black">Na sprzedaż ({listings?.length || 0})</span>
        <a href={`/zamowienia`} className="px-4 py-2 text-sm text-gray-500 hover:text-black">Sprzedaż</a>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Na sprzedaż</h2>
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {listings.map((item: any) => (
            <Link key={item.id} href={`/produkt/${item.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <Image src={item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80"} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="20vw" />
              </div>
              <p className="mt-1 font-medium text-gray-900">{item.price} zł</p>
              <p className="text-sm text-gray-500">{item.title}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Brak aktywnych ogłoszeń</p>
      )}

      {/* Reviews */}
      <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Opinie ({reviews?.length || 0})</h2>
      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{r.reviewer?.username || "Użytkownik"}</span>
                <span className="text-sm text-yellow-500">{"⭐".repeat(r.rating)}</span>
              </div>
              {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Brak opinii</p>
      )}
    </div>
  );
}