'use client'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[#243824] rounded-xl animate-pulse ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-[#162216] border border-[#243824] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-[#162216] border border-[#243824] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#162216] border border-[#243824] rounded-2xl overflow-hidden">
      <div className="border-b border-[#243824] p-4">
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#1a2e1a]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-8 items-center">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </motion.div>
  )
}

export function AdminSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </motion.div>
  )
}
