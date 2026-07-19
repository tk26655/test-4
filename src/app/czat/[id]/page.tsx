"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const otherId = params.id as string;
  const listingId = searchParams.get("listing");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase.from("profiles").select("username").eq("id", otherId).single();
      setOtherUser(profile);

      const { data: msgs } = await supabase.from("messages").select("*").or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`).order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);

      // Mark as read
      await supabase.from("messages").update({ read: true }).eq("receiver_id", user.id).eq("sender_id", otherId).eq("read", false);
    };
    init();
  }, [otherId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`chat:${userId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` }, (payload) => {
      const msg = payload.new;
      if (msg.sender_id === otherId) {
        setMessages((prev) => [...prev, msg]);
        supabase.from("messages").update({ read: true }).eq("id", msg.id);
      }
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;

    const { data, error } = await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: otherId,
      listing_id: listingId,
      content: newMsg.trim(),
    }).select().single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setNewMsg("");
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 py-3">
        <Link href="/czat" className="text-gray-500 hover:text-black">←</Link>
        <div className="font-medium text-gray-900">{otherUser?.username || "Użytkownik"}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === userId ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 py-3">
        <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Napisz wiadomość..." className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none" />
        <button type="submit" className="rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">Wyślij</button>
      </form>
    </div>
  );
}