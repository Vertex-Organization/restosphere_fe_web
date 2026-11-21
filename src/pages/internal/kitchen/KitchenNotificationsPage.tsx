import { useState } from 'react'
import { NOTIFICATION_KIND_LABEL } from '../../../api/kitchen/labels'
import type { KitchenNotification, NotificationKind } from '../../../api/kitchen/types'
import { formatDate, formatTime } from '../../../components/kitchen/format'
import { Icon, type IconName } from '../../../components/kitchen/Icon'
import { KitchenFilters } from '../../../components/kitchen/KitchenFilters'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { kitchenPaths, navigate } from '../../../routes/kitchenRouter'

const KIND: Record<NotificationKind, { icon: IconName; tone: string }> = {
  NEW_ORDER: { icon: 'receipt', tone: 'info' },
  ADD_ON: { icon: 'plusCircle', tone: 'info' },
  CANCELLED: { icon: 'xCircle', tone: 'danger' },
  INCIDENT_REPLY: { icon: 'message', tone: 'warning' },
  PRIORITY: { icon: 'flag', tone: 'danger' },
  MENU_REQUEST: { icon: 'utensils', tone: 'primary' },
}

export default function KitchenNotificationsPage() {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const sorted = [...data.notifications].sort((a, b) => b.at.localeCompare(a.at))
  const isUnread = (n: KitchenNotification) => !n.readBy.includes(user.id)
  const unread = sorted.filter(isUnread)
  const list = filter === 'unread' ? unread : sorted

  const open = (n: KitchenNotification) => {
    if (isUnread(n)) void run({ type: 'read-notifications', ids: [n.id] }, [`notif:${n.id}`])
    if (n.orderId && data.orders.some((o) => o.id === n.orderId))
      navigate(kitchenPaths.ticket(n.orderId))
    else if (n.incidentId) navigate(kitchenPaths.incidents)
    else if (n.kind === 'MENU_REQUEST') navigate(kitchenPaths.menuStatus)
  }

  return (
    <div className="k-page k-page--list">
      <div className="k-toolbar">
        <span className="k-toolbar-lead">
          <b>{unread.length}</b> chưa đọc · {sorted.length} thông báo
        </span>
        <KitchenFilters
          label="Lọc thông báo"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Tất cả', count: sorted.length },
            { value: 'unread', label: 'Chưa đọc', count: unread.length },
          ]}
        />
        <button
          type="button"
          className="k-btn k-btn--ghost k-toolbar-end"
          disabled={!unread.length || isPending('notif:all')}
          onClick={() => {
            void run({ type: 'read-notifications' }, ['notif:all'])
          }}
        >
          <Icon name="check" size={15} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      {list.length ? (
        <ul className="k-notifs">
          {list.map((n) => {
            const kind = KIND[n.kind] ?? { icon: 'bell' as const, tone: 'info' }
            const fresh = isUnread(n)
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`k-notif${fresh ? ' k-notif--unread' : ''}`}
                  onClick={() => open(n)}
                >
                  <span className={`k-notif-icon k-notif-icon--${kind.tone}`}>
                    <Icon name={kind.icon} size={16} />
                  </span>
                  <span className="k-notif-main">
                    <span className={`k-notif-kind k-notif-kind--${kind.tone}`}>
                      {NOTIFICATION_KIND_LABEL[n.kind]}
                    </span>
                    <span className="k-notif-title">{n.title}</span>
                    <span className="k-notif-body">{n.body}</span>
                  </span>
                  <span className="k-notif-side">
                    <span className="k-mono">
                      {formatTime(n.at)} · {formatDate(n.at)}
                    </span>
                    <span
                      className={fresh ? 'k-notif-state k-notif-state--unread' : 'k-notif-state'}
                    >
                      {fresh ? 'Chưa đọc' : 'Đã đọc'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="k-empty k-panel">
          {filter === 'unread' ? 'Bạn đã đọc hết thông báo.' : 'Chưa có thông báo.'}
        </p>
      )}
    </div>
  )
}
