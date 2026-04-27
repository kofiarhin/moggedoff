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
      <label className="block text-sm font-semibold text-zinc-900" htmlFor={inputId}>
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
          'group relative flex min-h-52 w-full overflow-hidden rounded-2xl border border-dashed p-3 text-left transition duration-300 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2',
          isDragging ? 'border-rose-500 bg-rose-50' : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400',
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
        <span className="relative mt-auto rounded-lg bg-white/90 px-3 py-2 text-sm text-zinc-700 shadow-[0_10px_24px_-18px_rgba(63,63,70,0.6)]">
          {file ? 'Click or drop to replace' : 'Drop image or browse'}
        </span>
      </button>
      <div className="flex min-h-5 items-start justify-between gap-3">
        <p className={error ? 'text-sm text-rose-700' : 'text-sm text-zinc-500'}>
          {error || 'Images from phone, camera, or browser under 5 MB.'}
        </p>
        {file ? (
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-700"
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
