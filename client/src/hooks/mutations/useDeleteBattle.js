import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBattle } from '../../services/battleService'
import { battleDetailQueryKey } from '../queries/useBattleDetail'
import { battleHistoryQueryKey } from '../queries/useBattleHistory'

export function useDeleteBattle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBattle,
    onSuccess: (battleId) => {
      queryClient.invalidateQueries({ queryKey: battleHistoryQueryKey })
      queryClient.removeQueries({ queryKey: battleDetailQueryKey(battleId) })
    },
  })
}
