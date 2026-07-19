import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sprawdź czy użytkownik jest adminem (na start: pierwszy użytkownik = admin)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isAdmin = profile?.username === "admin" || profile?.email?.includes("@vintera.pl");
  if (!isAdmin) redirect("/");

  const { data: listings } = await supabase.from("listings").select("*, profiles(username), listing_images(url)").order("created_at", { ascending: false }).limit(50);
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
  const { count: totalListings } = await supabase.from("listings").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Panel administracyjny</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ogłoszenia</p>
          <p className="text-2xl font-bold text-gray-900">{totalListings || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Użytkownicy</p>
          <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Butiki</p>
          <p className="text-2xl font-bold text-gray-900">{users?.filter((u: any) => u.is_boutique).length || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Transakcje</p>
          <p className="text-2xl font-bold text-gray-900">{users?.reduce((sum: number, u: any) => sum + (u.transactions_count || 0), 0) || 0}</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ostatnie ogłoszenia</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Tytuł</th>
              <th className="px-4 py-3 text-left">Sprzedający</th>
              <th className="px-4 py-3 text-left">Cena</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings?.map((l: any) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><Link href={`/produkt/${l.id}`} className="text-black hover:underline">{l.title}</Link></td>
                <td className="px-4 py-3 text-gray-600">{l.profiles?.username}</td>
                <td className="px-4 py-3 font-medium">{l.price} zł</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${l.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(l.created_at).toLocaleDateString("pl-PL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-gray-900">Użytkownicy</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-3 text-left">Nazwa</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Butik</th><th className="px-4 py-3 text-left">Transakcje</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-600">{u.email || "-"}</td>
                <td className="px-4 py-3">{u.is_boutique ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Tak</span> : <span className="text-gray-400">-</span>}</td>
                <td className="px-4 py-3">{u.transactions_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}