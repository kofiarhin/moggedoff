import InlineAlert from './InlineAlert'
import SkeletonResult from './SkeletonResult'

function WinnerPhoto({ src, label, glow, badgeText, badgeColor }) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        style={{
          aspectRatio: '4 / 5',
          animation: glow ? 'winner-glow 2s ease-out 0.5s infinite' : undefined,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={`Selfie ${label}`}
            className="winner-enter h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-white/[0.04]" />
        )}
      </div>
      <div className="badge-pop absolute left-3 top-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg ${badgeColor}`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  )
}

function BattleResult({ status, result, error, canRetry, onRetry, previews }) {
  if (status === 'pending') {
    return <SkeletonResult />
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#19191b] p-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
        <InlineAlert title="Battle paused" message={error?.message} />
        {canRetry ? (
          <button
            type="button"
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:translate-y-px disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            onClick={onRetry}
          >
            Retry analysis
          </button>
        ) : null}
      </div>
    )
  }

  if (status === 'success' && result) {
    const { winner, verdict, images } = result
    const isTie = winner === 'tie'
    const winnerText = isTie ? 'Too close to call' : `Selfie ${winner} wins`
    const total = Math.max(images.A.score + images.B.score, 1)
    const shareA = Math.round((images.A.score / total) * 100)
    const shareB = 100 - shareA

    return (
      <div className="rounded-2xl border border-white/10 bg-[#19191b] p-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
              Result
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Battle complete
            </h2>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">Scores are photo signals only.</p>
        </div>

        {isTie ? (
          <div className="grid grid-cols-2 gap-3">
            {['A', 'B'].map((key) => (
              <WinnerPhoto
                key={key}
                src={previews?.[`selfie${key}`]}
                label={key}
                glow={false}
                badgeText="Draw"
                badgeColor="bg-zinc-700"
              />
            ))}
          </div>
        ) : (
          <WinnerPhoto
            src={previews?.[`selfie${winner}`]}
            label={winner}
            glow
            badgeText="Winner"
            badgeColor="bg-rose-600"
          />
        )}

        <div className="fade-up mt-5">
          <h3 className="text-3xl font-semibold tracking-tight text-white">{winnerText}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{verdict}</p>
        </div>

        <div className="fade-up-delayed mt-5 space-y-3" aria-label="Score comparison">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {['A', 'B'].map((key) => {
              const isWinner = !isTie && key === winner
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-3 ${isWinner ? 'border-rose-500/40 bg-rose-950/25' : 'border-white/10 bg-white/[0.04]'}`}
                >
                  <p
                    className={`text-xs font-medium ${isWinner ? 'text-rose-300' : 'text-zinc-500'}`}
                  >
                    Selfie {key}
                    {isWinner ? ' - winner' : ''}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-white">
                    {images[key].score.toFixed(1)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className={`h-full transition-[width] duration-700 ${isTie ? 'bg-zinc-500' : 'bg-rose-500'}`}
              style={{ width: `${shareA}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">
            {isTie
              ? 'Scores are effectively tied.'
              : `Meter split: Selfie A ${shareA}%, Selfie B ${shareB}%.`}
          </p>
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">
          For entertainment only. Results reflect photo analysis, not personal worth.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Waiting</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        Results appear here
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Add two valid selfies, then run the battle. The app compares photo quality, face angle, and
        expression signals.
      </p>
    </div>
  )
}

export default BattleResult
