import Link from "next/link";

export default function Pagination({ currentPage, totalPages, searchParams }: { currentPage: number; totalPages: number; searchParams: any }) {
  if (totalPages <= 1) return null;

  const sp = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => { if (k !== "page" && v) sp.set(k, String(v)); });

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push(-1);
    }
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link href={`/?${sp.toString()}&page=${currentPage - 1}`} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</Link>
      )}
      {pages.map((p, i) => (
        p === -1 ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
        ) : (
          <Link key={p} href={`/?${sp.toString()}&page=${p}`} className={`rounded-md px-3 py-1.5 text-sm ${currentPage === p ? "bg-black text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>{p}</Link>
        )
      ))}
      {currentPage < totalPages && (
        <Link href={`/?${sp.toString()}&page=${currentPage + 1}`} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">→</Link>
      )}
    </div>
  );
}