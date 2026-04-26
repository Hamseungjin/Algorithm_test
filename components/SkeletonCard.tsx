export function SkeletonCard(): JSX.Element {
  return (
    <div className="card animate-pulse-slow">
      <div className="h-3 w-24 rounded bg-surfaceAlt" />
      <div className="mt-4 h-7 w-32 rounded bg-surfaceAlt" />
      <div className="mt-3 h-3 w-16 rounded bg-surfaceAlt" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
