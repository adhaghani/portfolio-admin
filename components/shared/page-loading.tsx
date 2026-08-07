export function PageLoading({ label }: { label?: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="heading-mono">{label ?? "Loading..."}</h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    </div>
  )
}
