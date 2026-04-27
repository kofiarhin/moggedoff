function SkeletonResult() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#19191b] p-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
      <div className="mb-5 border-b border-white/10 pb-5">
        <div className="skeleton-shimmer h-3 w-16 rounded" />
        <div className="skeleton-shimmer mt-3 h-7 w-44 rounded" />
      </div>
      <div className="skeleton-shimmer rounded-2xl" style={{ aspectRatio: '4 / 5' }} />
      <div className="mt-5">
        <div className="skeleton-shimmer h-3 w-14 rounded" />
        <div className="skeleton-shimmer mt-3 h-8 w-52 rounded" />
        <div className="skeleton-shimmer mt-3 h-4 w-full rounded" />
        <div className="skeleton-shimmer mt-2 h-4 w-2/3 rounded" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton-shimmer h-20 rounded-xl" />
        <div className="skeleton-shimmer h-20 rounded-xl" />
      </div>
      <div className="skeleton-shimmer mt-3 h-2.5 rounded-full" />
    </div>
  )
}

export default SkeletonResult
