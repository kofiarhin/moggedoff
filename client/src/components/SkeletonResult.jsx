function SkeletonResult() {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#19191b] p-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]"
      aria-busy="true"
    >
      <div className="mb-5 border-b border-white/10 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
          Analysis running
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Analyzing battle... This can take a moment.
        </h2>
        <p className="mt-2 max-w-[52ch] text-sm leading-6 text-zinc-400">
          Keeping both selfies locked while the matchup result is prepared.
        </p>
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
