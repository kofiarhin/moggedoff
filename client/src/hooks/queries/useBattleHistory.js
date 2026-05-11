import { useQuery } from '@tanstack/react-query'
import { listBattles } from '../../services/battleService'

export const battleHistoryQueryKey = ['battles']

export function useBattleHistory() {
  return useQuery({
    queryKey: battleHistoryQueryKey,
    queryFn: listBattles,
  })
}
