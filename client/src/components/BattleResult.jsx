import AnalysisMeter from './AnalysisMeter'
import InlineAlert from './InlineAlert'
import SkeletonResult from './SkeletonResult'

function BattleResult({ status, result, error, canRetry, onRetry }) {
  if (status === 'pending') {
    return <SkeletonResult />
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(63,63,70,0.35)]">
        <InlineAlert title="Battle paused" message={error?.message} />
        {canRetry ? (
          <button
            type="button"
            className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition active:translate-y-px disabled:cursor-not-allowed disabled:bg-zinc-300"
            onClick={onRetry}
          >
            Retry analysis
          </button>
        ) : null}
      </div>
    )
  }

  if (status === 'success' && result) {
    const winnerText = result.winner === 'tie' ? 'Too close to call' : `Selfie ${result.winner} wins`

    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(63,63,70,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          Result
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          {winnerText}
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{result.verdict}</p>
        <div className="mt-6">
          <AnalysisMeter
            scoreA={result.images.A.score}
            scoreB={result.images.B.score}
            winner={result.winner}
          />
        </div>
        <p className="mt-5 border-t border-zinc-200 pt-4 text-xs leading-5 text-zinc-500">
          For entertainment only. Results reflect photo analysis, not personal worth.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/75 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Waiting
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
        Results appear here
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Add two valid selfies, then run the battle. The app compares photo quality,
        face angle, and expression signals.
      </p>
    </div>
  )
}

export default BattleResult
