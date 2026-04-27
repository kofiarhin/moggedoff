import { describe, expect, test, vi } from 'vitest'
import { api } from '../src/lib/api'
import { analyzeBattle } from '../src/services/battleService'

vi.mock('../src/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
  normalizeApiError: vi.fn(() => ({
    code: 'NETWORK_ERROR',
    message: 'Normalized error.',
  })),
}))

describe('battleService', () => {
  test('posts battle images to analyze endpoint', async () => {
    api.post.mockResolvedValue({ data: { winner: 'A' } })

    const selfieA = new File(['a'], 'a.png', { type: 'image/png' })
    const selfieB = new File(['b'], 'b.png', { type: 'image/png' })
    const result = await analyzeBattle({ selfieA, selfieB })

    expect(api.post).toHaveBeenCalledWith('/api/battles/analyze', expect.any(FormData))
    const formData = api.post.mock.calls[0][1]
    expect(formData.get('selfieA')).toBe(selfieA)
    expect(formData.get('selfieB')).toBe(selfieB)
    expect(result).toEqual({ winner: 'A' })
  })

  test('normalizes service errors', async () => {
    api.post.mockRejectedValue(new Error('boom'))

    await expect(analyzeBattle({ selfieA: new File(['a'], 'a.png'), selfieB: new File(['b'], 'b.png') }))
      .rejects
      .toEqual({
        code: 'NETWORK_ERROR',
        message: 'Normalized error.',
      })
  })
})
