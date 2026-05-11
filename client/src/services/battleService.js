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

export async function listBattles() {
  try {
    const response = await api.get('/api/battles')
    return response.data.battles
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getBattle(battleId) {
  try {
    const response = await api.get(`/api/battles/${battleId}`)
    return response.data.battle
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteBattle(battleId) {
  try {
    await api.delete(`/api/battles/${battleId}`)
    return battleId
  } catch (error) {
    throw normalizeApiError(error)
  }
}
