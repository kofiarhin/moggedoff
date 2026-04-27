import axios from 'axios'

export function normalizeApiError(error) {
  const payload = error?.response?.data?.error

  if (payload?.code && payload?.message) {
    return payload
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      code: 'REQUEST_TIMEOUT',
      message: 'The analysis took too long. Try again with smaller images.',
    }
  }

  return {
    code: 'NETWORK_ERROR',
    message: 'The battle could not be analyzed right now.',
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 12000,
})
