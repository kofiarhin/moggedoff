import { useEffect, useMemo, useRef, useState } from 'react'
import AnalyzingOverlay from '../components/AnalyzingOverlay'
import BattleResult from '../components/BattleResult'
import BattleUploader from '../components/BattleUploader'
import { useAnalyzeBattle } from '../hooks/mutations/useAnalyzeBattle'
import { validateImageFile } from '../utils/fileValidation'

const initialFiles = {
  selfieA: null,
  selfieB: null,
}

const initialPreviews = {
  selfieA: '',
  selfieB: '',
}

const initialErrors = {
  selfieA: '',
  selfieB: '',
}

function BattlePage() {
  const [files, setFiles] = useState(initialFiles)
  const [previews, setPreviews] = useState(initialPreviews)
  const [errors, setErrors] = useState(initialErrors)
  const analyzeMutation = useAnalyzeBattle()

  const previewsRef = useRef(previews)

  useEffect(() => {
    previewsRef.current = previews
  }, [previews])

  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [])

  const canAnalyze = useMemo(() => {
    return Boolean(files.selfieA && files.selfieB && !errors.selfieA && !errors.selfieB)
  }, [errors.selfieA, errors.selfieB, files.selfieA, files.selfieB])

  const selectedCount = Number(Boolean(files.selfieA)) + Number(Boolean(files.selfieB))
  const flowSteps = [
    {
      label: 'Add two selfies',
      detail: `${selectedCount}/2 selected`,
      active: selectedCount < 2,
      done: selectedCount === 2,
    },
    {
      label: 'Run analysis',
      detail: analyzeMutation.isPending ? 'In progress' : canAnalyze ? 'Ready' : 'Waiting',
      active: selectedCount === 2 && !analyzeMutation.isSuccess,
      done: analyzeMutation.isSuccess,
    },
    {
      label: 'Review result',
      detail: analyzeMutation.isSuccess ? 'Complete' : 'Next',
      active: analyzeMutation.isSuccess,
      done: analyzeMutation.isSuccess,
    },
  ]

  function handleSelect(key, file) {
    const validation = validateImageFile(file)

    if (previews[key]) {
      URL.revokeObjectURL(previews[key])
    }

    if (!validation.valid) {
      setFiles((current) => ({ ...current, [key]: null }))
      setPreviews((current) => ({ ...current, [key]: '' }))
      setErrors((current) => ({ ...current, [key]: validation.message }))
      return
    }

    setFiles((current) => ({ ...current, [key]: file }))
    setPreviews((current) => ({ ...current, [key]: URL.createObjectURL(file) }))
    setErrors((current) => ({ ...current, [key]: '' }))
    analyzeMutation.reset()
  }

  function handleRemove(key) {
    if (previews[key]) {
      URL.revokeObjectURL(previews[key])
    }

    setFiles((current) => ({ ...current, [key]: null }))
    setPreviews((current) => ({ ...current, [key]: '' }))
    setErrors((current) => ({ ...current, [key]: '' }))
    analyzeMutation.reset()
  }

  function handleAnalyze() {
    if (!canAnalyze) return
    analyzeMutation.mutate(files)
  }

  function handleReset() {
    Object.values(previews).forEach((url) => {
      if (url) URL.revokeObjectURL(url)
    })
    setFiles(initialFiles)
    setPreviews(initialPreviews)
    setErrors(initialErrors)
    analyzeMutation.reset()
  }

  return (
    <main className="min-h-[100dvh] bg-[#111112] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
              Moggoff
            </p>
            <p className="mt-1 text-sm text-zinc-400">Photo battle analysis</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-zinc-300 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.8)] sm:flex">
            <span className="h-2 w-2 rounded-full bg-rose-400" aria-hidden="true" />
            Ready for two images
          </div>
        </header>

        <div className="grid gap-7 py-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-10">
          <aside className="lg:sticky lg:top-6">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-rose-300">Battle workspace</p>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
                Compare two selfies in a clear, guided flow.
              </h1>
              <p className="mt-5 max-w-[56ch] text-base leading-7 text-zinc-400">
                Add both images, confirm the pair, then run the analysis. Results stay beside the
                upload flow so the next action is always obvious.
              </p>
            </div>

            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {flowSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-4 py-4">
                  <div
                    className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition duration-300',
                      step.done
                        ? 'border-rose-500 bg-rose-600 text-white'
                        : step.active
                          ? 'border-white bg-white text-zinc-950'
                          : 'border-white/15 bg-transparent text-zinc-500',
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{step.label}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 border-l border-white/15 pl-5">
              <p className="text-sm font-semibold text-white">Best results</p>
              <p className="mt-2 max-w-[45ch] text-sm leading-6 text-zinc-400">
                Use bright, front-facing photos with one face clearly visible in each image.
              </p>
            </div>
          </aside>

          <section className="grid gap-5" aria-label="Battle setup and results">
            <div className="relative">
              {analyzeMutation.isPending && <AnalyzingOverlay previews={previews} />}
              <BattleUploader
                files={files}
                previews={previews}
                errors={errors}
                isPending={analyzeMutation.isPending}
                hasResult={analyzeMutation.isSuccess}
                canAnalyze={canAnalyze}
                onSelect={handleSelect}
                onRemove={handleRemove}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
              />
            </div>

            <section aria-live="polite">
              <BattleResult
                status={analyzeMutation.status}
                result={analyzeMutation.data}
                error={analyzeMutation.error}
                canRetry={canAnalyze}
                onRetry={handleAnalyze}
                previews={previews}
              />
            </section>
          </section>
        </div>
      </div>
    </main>
  )
}

export default BattlePage
