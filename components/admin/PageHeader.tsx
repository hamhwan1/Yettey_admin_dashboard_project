import type { ReactNode } from "react"

type Breadcrumb = {
  label: string
}

type PageHeaderProps = {
  title: string
  description: string
  eyebrow?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs?.length ? (
          <div className="mb-7 flex items-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? "font-semibold text-slate-950"
                      : undefined
                  }
                >
                  {item.label}
                </span>
                {index < breadcrumbs.length - 1 ? (
                  <span className="text-slate-400">/</span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        {eyebrow ? (
          <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  )
}
