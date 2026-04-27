function SkeletonResult() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(63,63,70,0.35)]">
      <div className="skeleton-shimmer h-4 w-28 rounded" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="skeleton-shimmer h-24 rounded-xl" />
        <div className="skeleton-shimmer h-24 rounded-xl" />
      </div>
      <div className="skeleton-shimmer mt-5 h-3 w-full rounded" />
      <div className="skeleton-shimmer mt-3 h-3 w-2/3 rounded" />
      <p className="mt-5 text-sm text-zinc-500">Uploading, analyzing, comparing.</p>
    </div>
  )
}

export default SkeletonResult
