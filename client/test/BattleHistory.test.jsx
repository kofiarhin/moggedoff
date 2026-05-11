import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../src/App'
import * as battleService from '../src/services/battleService'

vi.mock('../src/services/battleService')

const savedBattle = {
  id: 'battle_one',
  winner: 'A',
  loser: 'B',
  score: 82.4,
  createdAt: '2026-05-13T20:00:00.000Z',
  selfieAName: 'a.png',
  selfieBName: 'b.png',
  analysisSummary: 'Selfie A wins on sharper framing.',
  battleType: 'selfie',
}

function renderRoute(route) {
  window.history.pushState({}, '', route)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('battle history routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders saved battles on the history route', async () => {
    battleService.listBattles.mockResolvedValue([savedBattle])

    renderRoute('/battle-history')

    expect(await screen.findByRole('heading', { name: 'Battle history' })).toBeInTheDocument()
    expect(await screen.findByText('Selfie A wins')).toBeInTheDocument()
    expect(screen.getByText('Selfie A wins on sharper framing.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /selfie a wins/i })).toHaveAttribute(
      'href',
      '/battles/battle_one',
    )
  })

  test('renders an empty history state', async () => {
    battleService.listBattles.mockResolvedValue([])

    renderRoute('/battle-history')

    expect(await screen.findByText('No saved battles yet.')).toBeInTheDocument()
  })

  test('renders history fetch errors', async () => {
    battleService.listBattles.mockRejectedValue({ message: 'Could not load history.' })

    renderRoute('/battle-history')

    expect(await screen.findByText('History unavailable')).toBeInTheDocument()
    expect(screen.getByText('Could not load history.')).toBeInTheDocument()
  })

  test('renders battle detail route', async () => {
    battleService.getBattle.mockResolvedValue(savedBattle)

    renderRoute('/battles/battle_one')

    expect(await screen.findByRole('heading', { name: 'Battle detail' })).toBeInTheDocument()
    expect(await screen.findByText('Selfie A wins')).toBeInTheDocument()
    expect(screen.getByText('82.4')).toBeInTheDocument()
    expect(screen.getByText('a.png')).toBeInTheDocument()
    expect(screen.getByText('b.png')).toBeInTheDocument()
  })

  test('renders battle detail errors', async () => {
    battleService.getBattle.mockRejectedValue({ message: 'Battle result not found.' })

    renderRoute('/battles/battle_missing')

    expect(await screen.findByText('Battle not found')).toBeInTheDocument()
    expect(screen.getByText('Battle result not found.')).toBeInTheDocument()
  })

  test('does not delete when confirmation is canceled', async () => {
    battleService.getBattle.mockResolvedValue(savedBattle)
    const user = userEvent.setup()

    renderRoute('/battles/battle_one')

    await screen.findByText('Selfie A wins')
    await user.click(screen.getByRole('button', { name: 'Delete result' }))
    expect(screen.getByRole('dialog', { name: 'Delete this saved result?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(battleService.deleteBattle).not.toHaveBeenCalled()
  })

  test('deletes after confirmation and returns to history', async () => {
    battleService.getBattle.mockResolvedValue(savedBattle)
    battleService.deleteBattle.mockResolvedValue('battle_one')
    battleService.listBattles.mockResolvedValue([])
    const user = userEvent.setup()

    renderRoute('/battles/battle_one')

    await screen.findByText('Selfie A wins')
    await user.click(screen.getByRole('button', { name: 'Delete result' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(battleService.deleteBattle.mock.calls[0][0]).toBe('battle_one')
    expect(await screen.findByRole('heading', { name: 'Battle history' })).toBeInTheDocument()
  })

  test('shows delete failures without leaving detail', async () => {
    battleService.getBattle.mockResolvedValue(savedBattle)
    battleService.deleteBattle.mockRejectedValue({ message: 'Delete failed.' })
    const user = userEvent.setup()

    renderRoute('/battles/battle_one')

    await screen.findByText('Selfie A wins')
    await user.click(screen.getByRole('button', { name: 'Delete result' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(await screen.findByText('Delete failed')).toBeInTheDocument()
    expect(screen.getByText('Delete failed.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Battle detail' })).toBeInTheDocument()
  })
})
