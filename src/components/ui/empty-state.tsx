import * as React from "react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to display.",
  icon,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/60 text-accent-foreground shadow-sm">
          <span className="text-3xl">{icon}</span>
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mb-6 max-w-md text-base text-muted-foreground">{description}</p>
      {children}
    </div>
  )
}
