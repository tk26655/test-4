import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/search-bar";
import FilterSidebar from "@/components/filter-sidebar";
import WishlistButton from "@/components/wishlist-button";
import Pagination from "@/components/pagination";

export default async function HomePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = createClient();
  const category = typeof searchParams.category === "string" ? searchParams.category : "all";
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "osoby";
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const minPrice = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined;
  const size = typeof searchParams.size === "string" ? searchParams.size : undefined;
  const condition = typeof searchParams.condition === "string" ? searchParams.condition : undefined;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const perPage = 20;

  let query = supabase
    .from("listings")
    .select("*, profiles(username, avatar_url, is_boutique), listing_images(url)", { count: "exact" })
    .eq("status", "active");

  if (category !== "all") query = query.eq("category", category);
  if (tab === "butiki") query = query.eq("profiles.is_boutique", true);
  if (tab === "promocje") query = query.lt("price", 100);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%`);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (size) query = query.eq("size", size);
  if (condition) query = query.eq("condition", condition);

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: listings, count, error } = await query;
  if (error) console.error(error);
  const totalPages = Math.ceil((count || 0) / perPage);

  const categories = [
    { key: "all", label: "Wszystko" },
    { key: "kobiety", label: "Kobiety" },
    { key: "mezczyzni", label: "Mężczyźni" },
    { key: "dzieci", label: "Dzieci" },
    { key: "dom", label: "Dom" },
    { key: "akcesoria", label: "Akcesoria" },
  ];

  const tabs = [
    { key: "osoby", label: "Osoby" },
    { key: "butiki", label: "Butiki" },
    { key: "nowe", label: "Nowe" },
    { key: "promocje", label: "Promocje" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <SearchBar defaultValue={q} />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <Link key={t.key} href={`/?tab=${t.key}${category !== "all" ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <Link key={c.key} href={`/?category=${c.key}${tab !== "osoby" ? `&tab=${tab}` : ""}${q ? `&q=${q}` : ""}`} className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm transition ${category === c.key ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <FilterSidebar searchParams={searchParams} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{count || 0} wyników</p>
            <SortSelect current={sort} searchParams={searchParams} />
          </div>

          {listings && listings.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {listings.map((item: any) => (
                  <Link key={item.id} href={`/produkt/${item.id}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                      <Image src={item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80"} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                      <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                        <WishlistButton listingId={item.id} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-gray-900">{item.price} zł</p>
                      <p className="text-sm text-gray-500">{item.size} · {item.brand || "Bez marki"}</p>
                      <p className="text-xs text-gray-400">{item.profiles?.username || "Użytkownik"}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} searchParams={searchParams} />
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <p>Brak wyników</p>
              <p className="mt-1 text-sm">Spróbuj zmienić filtry lub wyszukiwanie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortSelect({ current, searchParams }: { current: string; searchParams: any }) {
  const sp = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => { if (k !== "sort" && v) sp.set(k, String(v)); });

  const options = [
    { key: "newest", label: "Najnowsze" },
    { key: "oldest", label: "Najstarsze" },
    { key: "price_asc", label: "Cena: od najniższej" },
    { key: "price_desc", label: "Cena: od najwyższej" },
  ];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">Sortuj:</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <Link key={o.key} href={`/?${sp.toString()}&sort=${o.key}`} className={`rounded-md px-2 py-1 text-xs transition ${current === o.key ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}