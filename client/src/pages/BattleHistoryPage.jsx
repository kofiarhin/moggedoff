import { Link } from 'react-router-dom'
import InlineAlert from '../components/InlineAlert'
import { useBattleHistory } from '../hooks/queries/useBattleHistory'

function formatDate(value) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function winnerLabel(battle) {
  return battle.winner === 'tie' ? 'Draw' : `Selfie ${battle.winner} wins`
}

function HistorySkeleton() {
  return (
    <div className="grid gap-4" aria-label="Loading battle history">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl border border-white/10 bg-[#19191b] p-5">
          <div className="skeleton-shimmer h-4 w-32 rounded-full" />
          <div className="skeleton-shimmer mt-5 h-8 w-3/4 rounded-xl" />
          <div className="skeleton-shimmer mt-4 h-4 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}

function BattleHistoryPage() {
  const historyQuery = useBattleHistory()
  const battles = historyQuery.data || []

  return (
    <main className="min-h-[100dvh] bg-[#111112] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
              Moggoff
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
              Battle history
            </h1>
            <p className="mt-4 max-w-[58ch] text-sm leading-6 text-zinc-400">
              Review saved matchups, compare the original signals, and open the full result.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex w-fit rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:translate-y-px"
          >
            New battle
          </Link>
        </header>

        <section className="grid gap-6 py-7 lg:grid-cols-[0.7fr_1.3fr] lg:py-10">
          <aside className="border-l border-white/15 pl-5">
            <p className="text-sm font-semibold text-white">Saved results</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              History is stored by the backend and is not tied to a user account yet.
            </p>
          </aside>

          <div>
            {historyQuery.isPending ? <HistorySkeleton /> : null}

            {historyQuery.isError ? (
              <div className="rounded-2xl border border-white/10 bg-[#19191b] p-5">
                <InlineAlert title="History unavailable" message={historyQuery.error?.message} />
              </div>
            ) : null}

            {historyQuery.isSuccess && battles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Empty history
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  No saved battles yet.
                </h2>
                <p className="mt-3 max-w-[48ch] text-sm leading-6 text-zinc-400">
                  Complete a battle and the result will appear here automatically.
                </p>
              </div>
            ) : null}

            {historyQuery.isSuccess && battles.length > 0 ? (
              <div className="grid gap-4">
                {battles.map((battle) => (
                  <Link
                    key={battle.id}
                    to={`/battles/${battle.id}`}
                    className="group rounded-2xl border border-white/10 bg-[#19191b] p-5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)] transition hover:border-rose-400/45 hover:bg-[#202024] active:translate-y-px"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                          {battle.battleType}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                          {winnerLabel(battle)}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {battle.analysisSummary}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-mono text-3xl font-semibold text-white">
                          {Number(battle.score).toFixed(1)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDate(battle.createdAt)}</p>
                      </div>
                    </div>
                    <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-zinc-500">Selfie A</dt>
                        <dd className="mt-1 truncate font-medium text-zinc-200">
                          {battle.selfieAName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Selfie B</dt>
                        <dd className="mt-1 truncate font-medium text-zinc-200">
                          {battle.selfieBName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Loser</dt>
                        <dd className="mt-1 font-medium text-zinc-200">
                          {battle.loser === 'tie' ? 'None' : `Selfie ${battle.loser}`}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}

export default BattleHistoryPage
