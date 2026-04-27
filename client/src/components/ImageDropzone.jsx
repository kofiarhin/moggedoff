import { useId, useRef, useState } from 'react'
import { ACCEPTED_IMAGE_INPUT } from '../constants/constants'

function ImageDropzone({
  label,
  file,
  previewUrl,
  error,
  disabled,
  onSelect,
  onRemove,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleFiles(files) {
    const nextFile = files?.[0]
    if (nextFile) onSelect(nextFile)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-zinc-100" htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_INPUT}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button
        type="button"
        className={[
          'group relative flex min-h-52 w-full overflow-hidden rounded-2xl border border-dashed p-3 text-left transition duration-300 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-[#19191b]',
          isDragging
            ? 'border-rose-400 bg-rose-950/30'
            : 'border-white/15 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.06]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ].join(' ')}
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (!disabled) handleFiles(event.dataTransfer.files)
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {!previewUrl ? (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center text-sm font-medium text-zinc-500">
            JPG, PNG, WebP, HEIC, AVIF, GIF, or BMP
          </span>
        ) : null}
        <span className="relative mt-auto rounded-lg border border-white/10 bg-zinc-950/75 px-3 py-2 text-sm text-zinc-200 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.95)]">
          {file ? 'Click or drop to replace' : 'Drop image or browse'}
        </span>
      </button>
      <div className="flex min-h-5 items-start justify-between gap-3">
        <p className={error ? 'text-sm text-rose-300' : 'text-sm text-zinc-500'}>
          {error || 'Images from phone, camera, or browser under 5 MB.'}
        </p>
        {file ? (
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-rose-300"
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ImageDropzone
