import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import InlineAlert from '../components/InlineAlert'
import { useDeleteBattle } from '../hooks/mutations/useDeleteBattle'
import { useBattleDetail } from '../hooks/queries/useBattleDetail'

function formatDate(value) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

function labelForSide(side) {
  if (side === 'tie') return 'Tie'
  return `Selfie ${side}`
}

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#19191b] p-6">
      <div className="skeleton-shimmer h-4 w-36 rounded-full" />
      <div className="skeleton-shimmer mt-6 h-10 w-3/4 rounded-xl" />
      <div className="skeleton-shimmer mt-5 h-24 w-full rounded-2xl" />
    </div>
  )
}

function BattleDetailPage() {
  const { battleId } = useParams()
  const navigate = useNavigate()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const battleQuery = useBattleDetail(battleId)
  const deleteMutation = useDeleteBattle()
  const battle = battleQuery.data

  function openDeleteConfirmation() {
    deleteMutation.reset()
    setIsConfirmingDelete(true)
  }

  function closeDeleteConfirmation() {
    if (deleteMutation.isPending) return
    deleteMutation.reset()
    setIsConfirmingDelete(false)
  }

  function confirmDelete() {
    if (!battle?.id) return

    deleteMutation.mutate(battle.id, {
      onSuccess: () => {
        navigate('/battle-history')
      },
    })
  }

  return (
    <main className="min-h-[100dvh] bg-[#111112] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
              Moggoff
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
              Battle detail
            </h1>
            <p className="mt-4 max-w-[58ch] text-sm leading-6 text-zinc-400">
              Inspect the saved result without storing the original images.
            </p>
          </div>
          <Link
            to="/battle-history"
            className="inline-flex w-fit rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:translate-y-px"
          >
            Back to history
          </Link>
        </header>

        <section className="grid gap-6 py-7 lg:grid-cols-[0.7fr_1.3fr] lg:py-10">
          <aside className="border-l border-white/15 pl-5">
            <p className="text-sm font-semibold text-white">Result ID</p>
            <p className="mt-2 break-all font-mono text-sm leading-6 text-zinc-400">{battleId}</p>
          </aside>

          <div>
            {battleQuery.isPending ? <DetailSkeleton /> : null}

            {battleQuery.isError ? (
              <div className="rounded-2xl border border-white/10 bg-[#19191b] p-5">
                <InlineAlert title="Battle not found" message={battleQuery.error?.message} />
              </div>
            ) : null}

            {battleQuery.isSuccess && battle ? (
              <article className="rounded-2xl border border-white/10 bg-[#19191b] p-6 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)]">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                      {battle.battleType}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      {battle.winner === 'tie'
                        ? 'The battle ended in a draw'
                        : `${labelForSide(battle.winner)} wins`}
                    </h2>
                    <p className="mt-3 max-w-[62ch] text-sm leading-6 text-zinc-400">
                      {battle.analysisSummary}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Score
                    </p>
                    <p className="mt-2 font-mono text-4xl font-semibold text-white">
                      {Number(battle.score).toFixed(1)}
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-sm text-zinc-500">Winner</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {labelForSide(battle.winner)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-sm text-zinc-500">Loser</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {battle.loser === 'tie' ? 'None' : labelForSide(battle.loser)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-sm text-zinc-500">Selfie A</dt>
                    <dd className="mt-1 truncate text-lg font-semibold text-white">
                      {battle.selfieAName}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-sm text-zinc-500">Selfie B</dt>
                    <dd className="mt-1 truncate text-lg font-semibold text-white">
                      {battle.selfieBName}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 border-t border-white/10 pt-4 text-sm text-zinc-500">
                  Saved {formatDate(battle.createdAt)}
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    className="rounded-lg border border-rose-400/40 bg-rose-950/35 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/70 hover:bg-rose-900/45 active:translate-y-px"
                    onClick={openDeleteConfirmation}
                  >
                    Delete result
                  </button>
                </div>
              </article>
            ) : null}
          </div>
        </section>
      </div>

      {isConfirmingDelete ? (
        <div
          className="fixed inset-0 flex items-center justify-center bg-zinc-950/75 px-4"
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#19191b] p-6 shadow-[0_24px_90px_-42px_rgba(0,0,0,0.95)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-battle-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
              Confirm delete
            </p>
            <h2
              id="delete-battle-title"
              className="mt-3 text-2xl font-semibold tracking-tight text-white"
            >
              Delete this saved result?
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              This removes the battle from history. The action cannot be undone.
            </p>

            {deleteMutation.isError ? (
              <div className="mt-4">
                <InlineAlert title="Delete failed" message={deleteMutation.error?.message} />
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.06] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                onClick={closeDeleteConfirmation}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 active:translate-y-px disabled:cursor-not-allowed disabled:bg-rose-900 disabled:text-rose-200"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default BattleDetailPage
