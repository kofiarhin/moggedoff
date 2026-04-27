import { useEffect, useMemo, useRef, useState } from 'react'
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
  previewsRef.current = previews

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
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_20%_0%,#fff1f2_0,#fafafa_36rem)] px-4 py-8 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section className="pt-2 lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
            Moggoff
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Pick two selfies. Let the photo signals call it.
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-zinc-600">
            The app compares image quality, face angle, and expression signals,
            then returns a quick winner for fun.
          </p>
          <div className="mt-8">
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
        </section>
        <section className="lg:pt-28" aria-live="polite">
          <BattleResult
            status={analyzeMutation.status}
            result={analyzeMutation.data}
            error={analyzeMutation.error}
            canRetry={canAnalyze}
            onRetry={handleAnalyze}
            previews={previews}
          />
        </section>
      </div>
    </main>
  )
}

export default BattlePage
