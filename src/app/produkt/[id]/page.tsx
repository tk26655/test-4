import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: listing } = await supabase.from("listings").select("*, profiles(*), listing_images(*)").eq("id", params.id).single();

  if (!listing) return notFound();

  const { data: similar } = await supabase.from("listings").select("*, listing_images(url)").eq("category", listing.category).eq("status", "active").neq("id", listing.id).limit(4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            <Image src={listing.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80"} alt={listing.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          {listing.listing_images && listing.listing_images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.listing_images.slice(1, 5).map((img: any, i: number) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">{listing.brand || "Bez marki"} · {listing.condition}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{listing.title}</h1>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{listing.price} zł</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">Rozmiar:</span> {listing.size}</p>
            <p><span className="font-medium text-gray-900">Kategoria:</span> {listing.category}{listing.subcategory ? ` / ${listing.subcategory}` : ""}</p>
            <p><span className="font-medium text-gray-900">Lokalizacja:</span> {listing.location || "Katowice"}</p>
          </div>

          {listing.description && (
            <div>
              <h3 className="font-medium text-gray-900">Opis</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href={`/czat/${listing.user_id}?listing=${listing.id}`} className="flex-1 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800">
              Napisz do sprzedającego
            </Link>
            <Link href={`/checkout?listing=${listing.id}`} className="rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
              Kup teraz
            </Link>
          </div>

          {/* Seller */}
          <Link href={`/profil/${listing.user_id}`} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-600">
              {(listing.profiles?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{listing.profiles?.username || "Użytkownik"}</p>
              <p className="text-sm text-gray-500">⭐ {listing.profiles?.rating || 5.0} · {listing.profiles?.transactions_count || 0} transakcji</p>
              {listing.profiles?.is_boutique && <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Butik</span>}
            </div>
          </Link>
        </div>
      </div>

      {/* Similar */}
      {similar && similar.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Podobne produkty</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similar.map((item: any) => (
              <Link key={item.id} href={`/produkt/${item.id}`} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  <Image src={item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80"} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="25vw" />
                </div>
                <p className="mt-1 font-medium text-gray-900">{item.price} zł</p>
                <p className="text-sm text-gray-500">{item.brand || "Bez marki"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}