import { api, normalizeApiError } from '../lib/api'

export async function analyzeBattle({ selfieA, selfieB }) {
  const formData = new FormData()
  formData.append('selfieA', selfieA)
  formData.append('selfieB', selfieB)

  try {
    const response = await api.post('/api/battles/analyze', formData)
    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
