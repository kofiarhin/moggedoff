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
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_20px_40px_-24px_rgba(63,63,70,0.35)] sm:p-5">
      <div className="grid gap-5">
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-lg bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-rose-800 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300"
          disabled={!canAnalyze || isPending}
          onClick={onAnalyze}
        >
          {isPending ? 'Analyzing battle' : 'Analyze battle'}
        </button>
        {hasResult ? (
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition duration-200 hover:bg-zinc-50 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2"
            onClick={onReset}
            disabled={isPending}
          >
            New battle
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default BattleUploader
