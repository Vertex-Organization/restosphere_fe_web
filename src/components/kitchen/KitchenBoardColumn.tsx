import type { ReactNode } from 'react'

interface Props {
  id: string
  labelledBy: string
  hidden: boolean
  title: string
  tone: 'active' | 'ready'
  summary?: ReactNode
  toolbar?: ReactNode
  hideHeader?: boolean
  layout?: 'cards' | 'workbench' | 'full'
  empty: string
  isEmpty: boolean
  children: ReactNode
}

/** One board column with its own scroll area. */
export function KitchenBoardColumn({ id, labelledBy, hidden, title, tone, summary, toolbar, hideHeader = false, layout = 'cards', empty, isEmpty, children }: Props) {
  return (
    <section className={`k-col k-col--${tone}`} id={id} role="tabpanel" aria-labelledby={labelledBy} hidden={hidden}>
      {!hideHeader && (
        <header className="k-col-head">
          <div className="k-col-titlebar">
            <h2 className="k-col-title">{title}</h2>
            {summary && <span className="k-col-summary">{summary}</span>}
          </div>
          {toolbar}
        </header>
      )}
      {/* Focusable so keyboard users can scroll a long column. */}
      <div className={`k-col-body${layout === 'workbench' ? ' k-col-body--workbench' : ''}`} tabIndex={0} aria-label={title}>
        {isEmpty ? <p className="k-empty">{empty}</p> : (
          <div className={layout === 'workbench' ? 'k-workbench' : layout === 'full' ? 'k-board-list' : 'k-ticket-grid'}>{children}</div>
        )}
      </div>
    </section>
  )
}
