import { useQuery } from '@tanstack/react-query'
import { platformApi } from '@/lib/api'
import type { PlatformStatsResponse } from '@/lib/api-types'
import { keys } from './keys'

const STATS_STALE_MS = 30_000

export function usePlatformStats() {
  return useQuery<PlatformStatsResponse>({
    queryKey: keys.platform.stats.all,
    queryFn: () => platformApi.getStats(),
    staleTime: STATS_STALE_MS,
  })
}
