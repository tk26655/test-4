"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WishlistButton({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("wishlist").select("id").eq("user_id", user.id).eq("listing_id", listingId).single();
      setSaved(!!data);
    };
    check();
  }, [listingId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;

    if (saved) {
      await supabase.from("wishlist").delete().eq("user_id", userId).eq("listing_id", listingId);
      setSaved(false);
    } else {
      await supabase.from("wishlist").insert({ user_id: userId, listing_id: listingId });
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`rounded-full p-2 transition ${saved ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-600 hover:text-red-500"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}