import { money, time } from '../../api/manager/dates'
import { employeeName, orderCode, orderStatus, tableForOrder } from '../../api/manager/selectors'
import type { ManagerData, Order } from '../../api/manager/types'
import { DataTable, DetailDialog, Facts, Status } from './ui'

export function OrderDetail({
  order,
  data,
  onClose,
}: {
  order: Order
  data: ManagerData
  onClose: () => void
}) {
  const rounds = data.orders
    .filter((o) => o.sessionId === order.sessionId)
    .sort((a, b) => a.round - b.round)
  return (
    <DetailDialog
      title={`Đơn ${orderCode(order)}`}
      subtitle={`Bàn ${tableForOrder(data, order)} · Lượt gọi ${order.round}`}
      entityId={order.id}
      onClose={onClose}
    >
      <Facts
        items={[
          ['Nhân viên gọi món', employeeName(data, order.employeeId)],
          ['Gửi lúc', time(order.at)],
          ['Trạng thái', <Status value={orderStatus(order)} />],
          ['Thanh toán', order.paid ? 'Đã thanh toán' : 'Chưa thanh toán'],
        ]}
      />
      <DataTable headers={['Món', 'SL', 'Đơn giá lúc gọi', 'Trạng thái']}>
        {order.items.map((i) => (
          <tr key={i.id}>
            <td>
              <strong>{i.name}</strong>
              {i.note && <small>{i.note}</small>}
            </td>
            <td>{i.quantity}</td>
            <td className="m-num">{money(i.unitPrice)}</td>
            <td>
              <Status value={i.status} />
            </td>
          </tr>
        ))}
      </DataTable>
      <div className="m-detail-block">
        <h3>Các lượt gọi trong phiên</h3>
        {rounds.map((o) => (
          <p className="m-booking-line" key={o.id}>
            {orderCode(o)} · Lượt {o.round} · {time(o.at)}
            <Status value={orderStatus(o)} />
          </p>
        ))}
      </div>
      <p className="m-note">
        Yêu cầu hủy hoặc sửa món được xử lý qua phê duyệt. Giá trong đơn được giữ theo thời điểm gọi
        món.
      </p>
    </DetailDialog>
  )
}
