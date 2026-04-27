function AnalysisMeter({ scoreA = 0, scoreB = 0, winner }) {
  const total = Math.max(scoreA + scoreB, 1)
  const shareA = Math.round((scoreA / total) * 100)
  const shareB = 100 - shareA

  return (
    <div className="space-y-3" aria-label="Score comparison">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-zinc-500">Selfie A</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-zinc-950">
            {scoreA.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-zinc-500">Selfie B</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-zinc-950">
            {scoreB.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
        <div
          className="h-full bg-rose-700 transition-[width] duration-300"
          style={{ width: `${shareA}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500">
        {winner === 'tie'
          ? 'Scores are effectively tied.'
          : `Meter split: Selfie A ${shareA} percent, Selfie B ${shareB} percent.`}
      </p>
    </div>
  )
}

export default AnalysisMeter
