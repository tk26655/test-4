export function ListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-16 rounded bg-gray-200" />
          <div className="mt-1 h-3 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}