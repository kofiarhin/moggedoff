import ImageDropzone from './ImageDropzone'

function BattleUploader({
  files,
  previews,
  errors,
  isPending,
  hasResult,
  canAnalyze,
  onSelect,
  onRemove,
  onAnalyze,
  onReset,
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#19191b] p-4 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)] sm:p-5">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
            Setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Choose the matchup
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-zinc-400">
          Replace either image before analysis. Both slots are required.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ImageDropzone
          label="Selfie A"
          file={files.selfieA}
          previewUrl={previews.selfieA}
          error={errors.selfieA}
          disabled={isPending}
          onSelect={(file) => onSelect('selfieA', file)}
          onRemove={() => onRemove('selfieA')}
        />
        <ImageDropzone
          label="Selfie B"
          file={files.selfieB}
          previewUrl={previews.selfieB}
          error={errors.selfieB}
          disabled={isPending}
          onSelect={(file) => onSelect('selfieB', file)}
          onRemove={() => onRemove('selfieB')}
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
        <button
          type="button"
          className="rounded-lg bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-rose-500 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-[#19191b] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={!canAnalyze || isPending}
          onClick={onAnalyze}
        >
          {isPending ? 'Analyzing battle' : 'Analyze battle'}
        </button>
        {hasResult ? (
          <button
            type="button"
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-100 transition duration-200 hover:bg-white/5 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-[#19191b]"
            onClick={onReset}
            disabled={isPending}
          >
            New battle
          </button>
        ) : null}
        <p className="text-sm text-zinc-500 sm:ml-auto">
          {canAnalyze ? 'Ready to analyze.' : 'Add both selfies to continue.'}
        </p>
      </div>
    </section>
  )
}

export default BattleUploader
