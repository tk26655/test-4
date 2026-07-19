"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = document.cookie.includes("cookies_accepted=true");
    if (!accepted) setShow(true);
  }, []);

  const accept = () => {
    document.cookie = "cookies_accepted=true;path=/;max-age=31536000";
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-gray-600">
          Używamy plików cookies, aby zapewnić najlepsze doświadczenie. Korzystając z Vintery, akceptujesz naszą <a href="/regulamin" className="underline">politykę prywatności</a>.
        </p>
        <button onClick={accept} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Akceptuję
        </button>
      </div>
    </div>
  );
}