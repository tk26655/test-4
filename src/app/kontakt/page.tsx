export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Kontakt</h1>
      <p className="mb-8 text-gray-600">Masz pytanie lub sugestię? Napisz do nas.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900">Email</h3>
          <p className="mt-1 text-gray-600">kontakt@vintera.pl</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900">Adres</h3>
          <p className="mt-1 text-gray-600">Vintera Sp. z o.o.<br/>ul. Mariacka 10<br/>40-014 Katowice</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900">Social media</h3>
          <p className="mt-1 text-gray-600">Instagram: @vintera.pl<br/>Facebook: /vinterapl</p>
        </div>
      </div>
    </div>
  );
}