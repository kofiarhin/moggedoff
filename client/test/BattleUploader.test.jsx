import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import BattlePage from '../src/pages/BattlePage'
import * as battleService from '../src/services/battleService'

vi.mock('../src/services/battleService')

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BattlePage />
    </QueryClientProvider>,
  )
}

function imageFile(name = 'selfie.png') {
  return new File(['image'], name, { type: 'image/png' })
}

describe('BattlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('analyze button is disabled initially', () => {
    renderPage()

    expect(screen.getByRole('button', { name: /analyze battle/i })).toBeDisabled()
  })

  test('valid image selections enable analyze', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderPage()

    await user.upload(screen.getByLabelText('Selfie A'), imageFile('a.png'))
    await user.upload(screen.getByLabelText('Selfie B'), imageFile('b.png'))

    expect(screen.getByRole('button', { name: /analyze battle/i })).toBeEnabled()
  })

  test('invalid file type shows inline error', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Selfie A'), {
      target: {
        files: [new File(['bad'], 'bad.txt', { type: 'text/plain' })],
      },
    })

    expect(screen.getByText('Use a JPEG, PNG, or WEBP image.')).toBeInTheDocument()
  })

  test('successful mutation displays winner and scores', async () => {
    battleService.analyzeBattle.mockResolvedValue({
      winner: 'A',
      verdict: 'Selfie A wins on sharper framing.',
      images: {
        A: { score: 82.4 },
        B: { score: 76.9 },
      },
    })

    const user = userEvent.setup()
    renderPage()

    await user.upload(screen.getByLabelText('Selfie A'), imageFile('a.png'))
    await user.upload(screen.getByLabelText('Selfie B'), imageFile('b.png'))
    await user.click(screen.getByRole('button', { name: /analyze battle/i }))

    expect(await screen.findByText('Selfie A wins')).toBeInTheDocument()
    expect(screen.getByText('82.4')).toBeInTheDocument()
    expect(screen.getByText('For entertainment only. Results reflect photo analysis, not personal worth.')).toBeInTheDocument()
  })

  test('pending mutation shows loading state', async () => {
    battleService.analyzeBattle.mockReturnValue(new Promise(() => {}))

    const user = userEvent.setup()
    renderPage()

    await user.upload(screen.getByLabelText('Selfie A'), imageFile('a.png'))
    await user.upload(screen.getByLabelText('Selfie B'), imageFile('b.png'))
    await user.click(screen.getByRole('button', { name: /analyze battle/i }))

    expect(await screen.findByText('Uploading, analyzing, comparing.')).toBeInTheDocument()
  })

  test('error mutation displays inline error and retry option', async () => {
    battleService.analyzeBattle.mockRejectedValue({
      code: 'AI_PROVIDER_ERROR',
      message: 'The provider is unavailable.',
    })

    const user = userEvent.setup()
    renderPage()

    await user.upload(screen.getByLabelText('Selfie A'), imageFile('a.png'))
    await user.upload(screen.getByLabelText('Selfie B'), imageFile('b.png'))
    await user.click(screen.getByRole('button', { name: /analyze battle/i }))

    expect(await screen.findByText('The provider is unavailable.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry analysis/i })).toBeEnabled()
  })

  test('reset clears selected images and result state', async () => {
    battleService.analyzeBattle.mockResolvedValue({
      winner: 'tie',
      verdict: 'This one is too close to call.',
      images: {
        A: { score: 79.2 },
        B: { score: 79.0 },
      },
    })

    const user = userEvent.setup()
    renderPage()

    await user.upload(screen.getByLabelText('Selfie A'), imageFile('a.png'))
    await user.upload(screen.getByLabelText('Selfie B'), imageFile('b.png'))
    await user.click(screen.getByRole('button', { name: /analyze battle/i }))
    await screen.findByText('Too close to call')
    await user.click(screen.getByRole('button', { name: /new battle/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analyze battle/i })).toBeDisabled()
    })
    expect(screen.getByText('Results appear here')).toBeInTheDocument()
  })
})
