import { useState } from 'react'
import {
  buildDayView,
  filterByRange,
  NOTIFICATION_PAGE_SIZE,
  type NotifyRange,
} from '../../../api/kitchen/dayGroups'
import {
  notificationKindShort,
  notificationParts,
  relativeAgo,
  ticketProgress,
} from '../../../api/kitchen/notifications'
import { minutesBetween } from '../../../api/kitchen/selectors'
import type { KitchenNotification } from '../../../api/kitchen/types'
import { formatTime } from '../../../components/kitchen/format'
import { Icon } from '../../../components/kitchen/Icon'
import { SelectMenu, type SelectOption } from '../../../components/kitchen/SelectMenu'
import { SegmentedFilter } from '../../../components/kitchen/SegmentedFilter'
import { useKitchenSnapshot } from '../../../hooks/kitchen/kitchenDataContext'
import { useNow } from '../../../hooks/kitchen/useNow'
import { kitchenPaths, navigate } from '../../../routes/kitchenRouter'

const RANGE_OPTIONS: SelectOption<NotifyRange>[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: '3days', label: '3 ngày gần nhất' },
]

export default function KitchenNotificationsPage() {
  const { data, run, isPending, user } = useKitchenSnapshot()
  const now = useNow()
  const [range, setRange] = useState<NotifyRange>('today')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [limit, setLimit] = useState(NOTIFICATION_PAGE_SIZE)
  const sorted = [...data.notifications].sort((a, b) => b.at.localeCompare(a.at))
  const isUnread = (n: KitchenNotification) => !n.readBy.includes(user.id)
  const inRange = filterByRange(sorted, now, range)
  const unread = inRange.filter(isUnread)
  const list = filter === 'unread' ? unread : inRange
  const { groups, total, shown } = buildDayView(list, now, range, limit)

  const canOpen = (n: KitchenNotification) =>
    (!!n.orderId && data.orders.some((o) => o.id === n.orderId)) || n.kind === 'MENU_REQUEST'

  const open = (n: KitchenNotification) => {
    if (isUnread(n)) void run({ type: 'read-notifications', ids: [n.id] }, [`notif:${n.id}`])
    if (n.orderId && data.orders.some((o) => o.id === n.orderId))
      navigate(kitchenPaths.ticket(n.orderId))
    else if (n.kind === 'MENU_REQUEST') navigate(kitchenPaths.menuStatus)
  }

  const changeRange = (next: NotifyRange) => {
    setRange(next)
    setLimit(NOTIFICATION_PAGE_SIZE)
  }
  const changeFilter = (next: 'all' | 'unread') => {
    setFilter(next)
    setLimit(NOTIFICATION_PAGE_SIZE)
  }

  return (
    <div className="k-page k-page--list">
      <div className="k-toolbar">
        <SelectMenu
          value={range}
          onChange={changeRange}
          buttonLabel="Khoảng thời gian"
          listLabel="Khoảng thời gian"
          options={RANGE_OPTIONS}
        />
        <div className="k-toolbar-group">
          <SegmentedFilter
            label="Lọc thông báo"
            value={filter}
            onChange={changeFilter}
            options={[
              { value: 'all', label: 'Tất cả', count: inRange.length },
              { value: 'unread', label: 'Chưa đọc', count: unread.length },
            ]}
          />
          <button
            type="button"
            className="k-btn k-btn--ghost"
            disabled={!unread.length || isPending('notif:all')}
            onClick={() => {
              void run({ type: 'read-notifications' }, ['notif:all'])
            }}
          >
            <Icon name="check" size={15} />
            Đánh dấu đã đọc
          </button>
        </div>
      </div>
      {groups.length > 0 ? (
        <div className="k-notif-groups">
          {groups.map((group) => (
            <section key={group.id}>
              {range === '3days' && <h3 className="k-notif-group">{group.label}</h3>}
              <ul className="k-notifs">
                {group.items.map((n) => {
                  const fresh = isUnread(n)
                  const openable = canOpen(n)
                  const { table, detail } = notificationParts(n, data)
                  const progress = ticketProgress(data, n.orderId)
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={`k-notif${fresh ? ' k-notif--unread' : ''}${openable ? '' : ' k-notif--static'}`}
                        onClick={() => open(n)}
                      >
                        <span className="k-notif-dot" aria-hidden="true" />
                        <span className="k-notif-kind">
                          {fresh && <span className="k-visually-hidden">Chưa đọc: </span>}
                          {notificationKindShort(n.kind)}
                        </span>
                        <span className="k-notif-subject">
                          {table && <b>{table}</b>}
                          {detail && <span className="k-notif-detail">{detail}</span>}
                        </span>
                        <span className="k-notif-progress">{progress}</span>
                        <time className="k-notif-time" dateTime={n.at}>
                          {formatTime(n.at)} · {relativeAgo(minutesBetween(n.at, now))}
                        </time>
                        <span className="k-notif-chevron" aria-hidden="true">
                          {openable ? '›' : ''}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
          {shown < total && (
            <button
              type="button"
              className="k-btn k-btn--ghost k-notif-more"
              onClick={() => setLimit((value) => value + NOTIFICATION_PAGE_SIZE)}
            >
              Xem thêm ({total - shown})
            </button>
          )}
        </div>
      ) : (
        <p className="k-empty k-panel">
          {filter === 'unread' ? 'Bạn đã đọc hết thông báo.' : 'Chưa có thông báo.'}
        </p>
      )}
    </div>
  )
}
