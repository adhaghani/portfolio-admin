import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function PageHeader({
  title,
  actionLabel,
  actionHref,
  actionOnClick,
}: {
  title: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="heading-mono">{title}</h1>
      {actionLabel &&
        (actionHref ? (
          <Button
            asChild
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href={actionHref}>
              <Plus className="mr-1.5 size-4" />
              {actionLabel}
            </Link>
          </Button>
        ) : actionOnClick ? (
          <Button
            onClick={actionOnClick}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="mr-1.5 size-4" />
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  )
}
