"use client";

import Link from "next/link";

export default function FilterSidebar({ searchParams }: { searchParams: any }) {
  const sp = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => { if (k !== "minPrice" && k !== "maxPrice" && k !== "size" && k !== "condition" && k !== "page" && v) sp.set(k, String(v)); });

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"];
  const conditions = [
    { key: "nowe", label: "Nowe z metką" },
    { key: "jak_nowe", label: "Jak nowe" },
    { key: "dobry", label: "Dobry stan" },
    { key: "zadowalajacy", label: "Zadowalający" },
  ];

  return (
    <aside className="w-full shrink-0 space-y-5 lg:w-52">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Cena</h3>
        <div className="flex gap-2">
          <Link href={`/?${sp.toString()}&minPrice=0&maxPrice=50`} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-black">0-50 zł</Link>
          <Link href={`/?${sp.toString()}&minPrice=50&maxPrice=100`} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-black">50-100 zł</Link>
          <Link href={`/?${sp.toString()}&minPrice=100&maxPrice=200`} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-black">100-200 zł</Link>
          <Link href={`/?${sp.toString()}&minPrice=200`} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-black">200+ zł</Link>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Rozmiar</h3>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <Link key={s} href={`/?${sp.toString()}&size=${s}`} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-black">{s}</Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Stan</h3>
        <div className="space-y-1">
          {conditions.map((c) => (
            <Link key={c.key} href={`/?${sp.toString()}&condition=${c.key}`} className="block text-xs text-gray-600 hover:text-black">{c.label}</Link>
          ))}
        </div>
      </div>

      <Link href="/" className="block text-xs text-gray-400 underline hover:text-black">Wyczyść filtry</Link>
    </aside>
  );
}