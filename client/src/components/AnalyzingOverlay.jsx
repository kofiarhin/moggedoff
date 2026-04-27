import { useEffect, useState } from 'react'

const PHASES = [
  'Uploading images',
  'Detecting faces',
  'Analyzing signals',
  'Comparing results',
  'Calculating winner',
]

function ScanRing({ delay }) {
  return (
    <div
      className="absolute inset-0 rounded-full border border-rose-500"
      style={{ opacity: 0, animation: `radar-pulse 2s ease-out ${delay}s infinite` }}
    />
  )
}

function FaceScanner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
        <div className="absolute inset-0 rounded-full border border-zinc-700" />
        <ScanRing delay={0} />
        <ScanRing delay={0.67} />
        <ScanRing delay={1.33} />
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'rgb(244 63 94)',
            borderRightColor: 'rgba(244,63,94,0.25)',
            animation: 'scan-rotate 1.1s linear infinite',
          }}
        />
        <div className="absolute h-px w-3 bg-rose-500/40" />
        <div className="absolute h-3 w-px bg-rose-500/40" />
        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_3px_rgba(244,63,94,0.7)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
  )
}

function AnalyzingOverlay({ previews }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [textVisible, setTextVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => {
        setPhaseIndex((i) => (i + 1) % PHASES.length)
        setTextVisible(true)
      }, 180)
    }, 1600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-2xl">
      {/* Ghosted selfies as background */}
      <div className="absolute inset-0 flex">
        <div className="relative flex-1 overflow-hidden">
          {previews.selfieA && (
            <img
              src={previews.selfieA}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{ opacity: 0.18, filter: 'blur(6px)', transform: 'scale(1.1)' }}
            />
          )}
        </div>
        <div className="relative flex-1 overflow-hidden">
          {previews.selfieB && (
            <img
              src={previews.selfieB}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{ opacity: 0.18, filter: 'blur(6px)', transform: 'scale(1.1)' }}
            />
          )}
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-zinc-950/88" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-6">
        {/* Scanners + VS */}
        <div className="flex items-center gap-6 sm:gap-10">
          <FaceScanner label="Selfie A" />

          <span
            className="text-3xl font-black tracking-widest text-white"
            style={{ animation: 'vs-glow 1.4s ease-in-out infinite' }}
          >
            VS
          </span>

          <FaceScanner label="Selfie B" />
        </div>

        {/* Status + scan bar */}
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-sm font-semibold text-zinc-300 transition-opacity duration-150"
            style={{ opacity: textVisible ? 1 : 0 }}
            aria-live="polite"
          >
            {PHASES[phaseIndex]}
          </p>
          <div className="relative h-px w-32 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="absolute top-0 h-full w-1/2 rounded-full"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgb(225 29 72), transparent)',
                animation: 'scan-bar 1.4s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyzingOverlay
