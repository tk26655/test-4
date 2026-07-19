import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    { num: "1", title: "Znajdź", desc: "Przeglądaj tysiące ofert od osób prywatnych i butików z całej Polski. Użyj filtrów, aby znaleźć dokładnie to, czego szukasz." },
    { num: "2", title: "Napisz", desc: "Masz pytanie? Napisz do sprzedającego przez wbudowany czat. Negocjuj cenę, ustal szczegóły, zapytaj o wymiary." },
    { num: "3", title: "Kup", desc: "Zapłać bezpiecznie przez platformę. Pieniądze są przechowywane do momentu potwierdzenia odbioru przez Ciebie." },
    { num: "4", title: "Oceń", desc: "Po transakcji wystaw opinię sprzedającemu. Budujemy społeczność opartą na zaufaniu i jakości." },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Jak działa Vintera?</h1>
      <p className="mb-10 text-gray-600">Kupuj i sprzedawaj modę w 4 prostych krokach.</p>

      <div className="space-y-8">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{s.num}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-gray-600">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-gray-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Gotowy na start?</h3>
        <p className="mt-1 text-gray-600">Dołącz do tysięcy użytkowników i zacznij sprzedawać już dziś.</p>
        <Link href="/dodaj" className="mt-4 inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800">Dodaj ogłoszenie</Link>
      </div>
    </div>
  );
}