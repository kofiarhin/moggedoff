import { useMutation } from '@tanstack/react-query'
import { analyzeBattle } from '../../services/battleService'

export function useAnalyzeBattle() {
  return useMutation({
    mutationFn: analyzeBattle,
  })
}
