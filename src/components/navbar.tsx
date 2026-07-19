import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let unreadCount = 0;
  let isAdmin = false;
  if (user) {
    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("read", false);
    unreadCount = count || 0;
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    isAdmin = profile?.username === "admin";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight text-black">
          Vintera
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/jak-to-dziala" className="text-sm text-gray-600 hover:text-black">Jak to działa</Link>
          <Link href="/butiki" className="text-sm text-gray-600 hover:text-black">Butiki</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/zapisane" className="hidden text-sm text-gray-500 hover:text-black sm:block">Zapisane</Link>
              <Link href="/czat" className="relative text-sm text-gray-500 hover:text-black">
                Czat
                {unreadCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/moje-ogloszenia" className="hidden text-sm text-gray-500 hover:text-black sm:block">Moje</Link>
              <Link href="/zamowienia" className="hidden text-sm text-gray-500 hover:text-black sm:block">Zamówienia</Link>
              <Link href="/adresy" className="hidden text-sm text-gray-500 hover:text-black sm:block">Adresy</Link>
              {isAdmin && (
                <Link href="/admin" className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">Admin</Link>
              )}
              <Link href="/dodaj" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                + Dodaj
              </Link>
            </>
          ) : (
            <Link href="/login" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Zaloguj
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}