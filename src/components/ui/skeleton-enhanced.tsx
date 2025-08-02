import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "default" | "text" | "avatar" | "card"
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const variants = {
    default: "rounded-md bg-muted",
    text: "h-4 bg-muted rounded",
    avatar: "rounded-full bg-muted",
    card: "rounded-lg bg-muted"
  }

  return (
    <div
      className={cn(
        "animate-pulse",
        variants[variant],
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <Skeleton variant="text" className="h-3 w-full" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}