import type { ReactNode } from 'react'

interface Props {
  id: string
  title: string
  tone: 'active' | 'ready'
  summary: ReactNode
  toolbar?: ReactNode
  empty: string
  isEmpty: boolean
  children: ReactNode
}

/** One board column with its own scroll area. */
export function KitchenBoardColumn({ id, title, tone, summary, toolbar, empty, isEmpty, children }: Props) {
  return (
    <section className={`k-col k-col--${tone}`} id={id} aria-labelledby={`${id}-title`}>
      <header className="k-col-head">
        <div className="k-col-titlebar">
          <h2 id={`${id}-title`} className="k-col-title">{title}</h2>
          <span className="k-col-summary">{summary}</span>
        </div>
        {toolbar}
      </header>
      {/* Focusable so keyboard users can scroll a long column. */}
      <div className="k-col-body" tabIndex={0} aria-label={title}>
        {isEmpty ? <p className="k-empty">{empty}</p> : <div className="k-ticket-grid">{children}</div>}
      </div>
    </section>
  )
}
