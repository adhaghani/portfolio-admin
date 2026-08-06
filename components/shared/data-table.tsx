import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  actions?: (item: T) => ReactNode
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-none border border-border/50 bg-card",
        className,
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-left font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="w-24 px-4 py-2.5 text-right font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-12 text-center font-mono text-sm text-muted-foreground"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2.5 font-mono text-sm text-foreground"
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-2.5 text-right">{actions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
