import { useQuery } from '@tanstack/react-query'
import { getBattle } from '../../services/battleService'

export function battleDetailQueryKey(battleId) {
  return ['battles', battleId]
}

export function useBattleDetail(battleId) {
  return useQuery({
    queryKey: battleDetailQueryKey(battleId),
    queryFn: () => getBattle(battleId),
    enabled: Boolean(battleId),
  })
}
