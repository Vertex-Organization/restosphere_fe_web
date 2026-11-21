import { useState } from 'react'
import { minutes, time } from '../../api/manager/dates'
import { employeeName, orderCode, tableForOrder } from '../../api/manager/selectors'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { useNow } from '../../hooks/kitchen/useNow'
import { managerPath } from '../../routes/managerRouter'
import {
  DataTable,
  Filter,
  Link,
  Metrics,
  PageHeading,
  Panel,
  RowAction,
  Search,
  Status,
} from '../../components/manager/ui'
import { matchesSearch, statusOptions } from '../../api/manager/labels'
import { OrderDetail } from '../../components/manager/OrderDetail'

export default function KitchenMonitorPage() {
  const { data: d } = useManagerData()
  const now = useNow()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState('')
  if (!d) return null
  const items = d.orders.flatMap((o) =>
    o.items
      .filter((i) => ['SUBMITTED', 'PREPARING', 'READY'].includes(i.status))
      .map((item) => ({ order: o, item })),
  )
  const rows = items.filter(
    ({ item, order }) =>
      matchesSearch(query, item.name, tableForOrder(d, order), order.id, orderCode(order)) &&
      (!status || item.status === status),
  )
  const order = d.orders.find((o) => o.id === selected)
  return (
    <>
      <PageHeading
        title="Giám sát bếp"
        description="Theo dõi tiến độ món và thời gian chờ. Trạng thái do bếp và phục vụ cập nhật."
        actions={
          <Link className="k-btn" to={managerPath('incidents')}>
            Xem sự cố bếp
          </Link>
        }
      />
      <Metrics
        items={[
          {
            label: 'Món mới',
            value: items
              .filter((r) => r.item.status === 'SUBMITTED')
              .reduce((n, r) => n + r.item.quantity, 0),
            icon: 'receipt',
          },
          {
            label: 'Đang chế biến',
            value: items
              .filter((r) => r.item.status === 'PREPARING')
              .reduce((n, r) => n + r.item.quantity, 0),
            icon: 'utensils',
          },
          {
            label: 'Đã xong · chờ phục vụ',
            value: items
              .filter((r) => r.item.status === 'READY')
              .reduce((n, r) => n + r.item.quantity, 0),
            icon: 'checkCircle',
          },
          {
            label: 'Món quá 25 phút',
            value: items
              .filter((r) => r.item.status !== 'READY' && minutes(r.order.at, now) > 25)
              .reduce((n, r) => n + r.item.quantity, 0),
            icon: 'clock',
          },
        ]}
      />
      <Panel title="Tiến độ món ăn">
        <div className="m-toolbar">
          <Search value={query} onChange={setQuery} placeholder="Tìm món, bàn, mã đơn…" />
          <Filter
            label="Trạng thái món"
            value={status}
            onChange={setStatus}
            options={statusOptions(['SUBMITTED', 'PREPARING', 'READY'])}
          />
        </div>
        <DataTable
          headers={['Bàn · đơn', 'Món ăn', 'SL', 'Trạng thái', 'Phụ trách', 'Thời gian', '']}
          empty={!rows.length}
          count={rows.length}
        >
          {rows.map(({ item: i, order: o }) => (
            <tr key={i.id}>
              <td>
                <span className="m-table-code">{tableForOrder(d, o)}</span>
                <small>{orderCode(o)}</small>
              </td>
              <td>
                <strong>{i.name}</strong>
                {i.note && <small className="m-warning">{i.note}</small>}
              </td>
              <td>{i.quantity}</td>
              <td>
                <Status value={i.status} />
              </td>
              <td>{employeeName(d, i.chefId)}</td>
              <td>
                {i.status === 'READY' ? (
                  `Xong lúc ${i.readyAt ? time(i.readyAt) : '—'}`
                ) : (
                  <span className={minutes(o.at, now) > 25 ? 'm-danger' : ''}>
                    {minutes(o.at, now)} phút
                  </span>
                )}
              </td>
              <td>
                <RowAction onClick={() => setSelected(o.id)} />
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      {order && <OrderDetail order={order} data={d} onClose={() => setSelected('')} />}
    </>
  )
}
