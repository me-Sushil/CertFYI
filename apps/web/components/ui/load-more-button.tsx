'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function LoadMoreButton({ hasNextPage, isFetchingNextPage, fetchNextPage }: LoadMoreButtonProps) {
  if (!hasNextPage) return null
  return (
    <div className="py-6 text-center">
      <Button variant="outline" onClick={fetchNextPage} disabled={isFetchingNextPage}>
        {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
        Load More
      </Button>
    </div>
  )
}
