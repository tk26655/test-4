"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ChatListPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase.rpc("get_conversations", { user_uuid: user.id });
      if (data) setConversations(data);
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Wiadomości</h1>
      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((c: any) => (
            <Link key={c.other_user_id} href={`/czat/${c.other_user_id}`} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                {(c.other_username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{c.other_username || "Użytkownik"}</p>
                <p className="truncate text-sm text-gray-500">{c.last_message || "Brak wiadomości"}</p>
              </div>
              {c.unread_count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">{c.unread_count}</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">Brak konwersacji</p>
      )}
    </div>
  );
}