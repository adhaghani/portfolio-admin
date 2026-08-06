import Link from "next/link"
import { type LucideIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-none border border-border/50 bg-card py-20">
      <div className="halftone-dots pointer-events-none absolute inset-0 text-muted-foreground/[0.04]" />
      {Icon && (
        <div className="relative mb-4 text-muted-foreground/40">
          <Icon className="size-12" />
        </div>
      )}
      <h3 className="relative font-mono text-sm font-medium tracking-wider text-foreground uppercase">
        {title}
      </h3>
      {description && (
        <p className="relative mt-1 max-w-sm text-center font-mono text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button
          asChild
          className="relative mt-6 bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href={actionHref}>
            <Plus className="mr-1.5 size-4" />
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  )
}
