import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BoutiquesPage() {
  const supabase = createClient();
  const { data: boutiques } = await supabase.from("profiles").select("*").eq("is_boutique", true).eq("boutique_verified", true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Butiki i sklepy</h1>
      {boutiques && boutiques.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boutiques.map((b: any) => (
            <Link key={b.id} href={`/profil/${b.id}`} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-gray-400 transition">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-600">
                {(b.boutique_name || b.username).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{b.boutique_name || b.username}</p>
                  <svg className="h-4 w-4 shrink-0 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <p className="text-sm text-gray-500">{b.boutique_description || "Butik na Vinterze"}</p>
                <p className="text-xs text-gray-400">⭐ {b.rating || 5.0} · {b.transactions_count || 0} transakcji</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Jeszcze nie ma zweryfikowanych butików</p>
          <p className="mt-1 text-sm text-gray-400">Bądź pierwszy! Skontaktuj się z nami, aby zweryfikować swój sklep.</p>
        </div>
      )}
    </div>
  );
}