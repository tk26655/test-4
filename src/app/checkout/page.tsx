"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing");

  const [listing, setListing] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!listingId) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Pobierz produkt
      const { data: product } = await supabase
        .from("listings")
        .select("*, profiles(id, username), listing_images(url)")
        .eq("id", listingId)
        .single();
      if (product) setListing(product);

      // Pobierz zapisane adresy
      const { data: addresses } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      if (addresses) {
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find((a: any) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm({
            name: defaultAddr.name,
            email: defaultAddr.email,
            phone: defaultAddr.phone || "",
            address: defaultAddr.address,
            city: defaultAddr.city,
            postal: defaultAddr.postal,
          });
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [listingId]);

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setForm({
      name: addr.name,
      email: addr.email,
      phone: addr.phone || "",
      address: addr.address,
      city: addr.city,
      postal: addr.postal,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    setSubmitting(true);

    // Zapisz nowy adres jeśli zaznaczone
    if (saveNewAddress && selectedAddressId === "") {
      await supabase.from("saved_addresses").insert({
        user_id: user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal: form.postal,
        is_default: savedAddresses.length === 0,
      });
    }

    const { data, error } = await supabase.from("orders").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.profiles.id,
      listing_title: listing.title,
      listing_price: listing.price,
      listing_image: listing.listing_images?.[0]?.url,
      buyer_name: form.name,
      buyer_email: form.email,
      buyer_email_snapshot: form.email,
      buyer_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_postal: form.postal,
      status: "pending",
      payment_status: "pending",
    }).select().single();

    if (!error && data) {
      router.push(`/zamowienia/${data.id}?success=1`);
    } else {
      alert("Błąd: " + error?.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Ładowanie...</div>;
  if (!listing) return <div className="py-20 text-center text-gray-400">Nie znaleziono produktu</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Zamówienie</h1>

      {/* Product summary */}
      <div className="mb-6 flex gap-4 rounded-xl border border-gray-200 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <Image src={listing.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80"} alt={listing.title} fill className="object-cover" sizes="80px" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{listing.title}</p>
          <p className="text-sm text-gray-500">{listing.brand || "Bez marki"} · {listing.size}</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{listing.price} zł</p>
        </div>
      </div>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Zapisane adresy</h2>
          <div className="space-y-2">
            {savedAddresses.map((addr: any) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectAddress(addr)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${selectedAddressId === addr.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{addr.name}</span>
                  {addr.is_default && <span className="rounded bg-black px-2 py-0.5 text-xs text-white">Domyślny</span>}
                </div>
                <p className="text-gray-500">{addr.address}, {addr.postal} {addr.city}</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setSelectedAddressId(""); setForm({ name: "", email: "", phone: "", address: "", city: "", postal: "" }); }}
              className={`w-full rounded-lg border p-3 text-left text-sm transition ${selectedAddressId === "" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
            >
              <span className="font-medium">+ Nowy adres</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Dane dostawy</h2>
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="Imię i nazwisko" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="col-span-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
          <input required placeholder="Ulica i numer" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="col-span-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
          <input required placeholder="Kod pocztowy" value={form.postal} onChange={(e) => setForm({...form, postal: e.target.value})} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
          <input required placeholder="Miasto" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
        </div>

        {selectedAddressId === "" && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="rounded border-gray-300" />
            Zapisz ten adres na przyszłość
          </label>
        )}

        <div className="rounded-xl bg-gray-50 p-4">
          <h3 className="font-medium text-gray-900">Podsumowanie</h3>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">Produkt</span>
            <span className="font-medium">{listing.price} zł</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-600">Dostawa</span>
            <span className="font-medium text-green-600">Za darmo</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
            <span className="font-semibold text-gray-900">Razem</span>
            <span className="text-lg font-bold text-gray-900">{listing.price} zł</span>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <strong>Testowa wersja:</strong> Płatność jest symulowana. W prawdziwej wersji zostanie dodany Stripe/BLIK.
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {submitting ? "Składanie zamówienia..." : "Potwierdź zamówienie (test)"}
        </button>
      </form>
    </div>
  );
}