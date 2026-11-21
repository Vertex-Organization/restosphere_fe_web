import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { time } from '../../api/manager/dates'
import { employeeName } from '../../api/manager/selectors'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import { managerPath } from '../../routes/managerRouter'
import {
  Button,
  DetailDialog,
  Empty,
  Facts,
  Filter,
  FormDialog,
  Icon,
  Link,
  PageHeading,
  Panel,
  Status,
} from '../../components/manager/ui'
import { optionsOf, statusOptions } from '../../api/manager/labels'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'

export default function TablesPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData()
  const user = useManagerUser()!
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(selectedId)
  const [editing, setEditing] = useState(false)
  if (!d) return null
  const table = d.tables.find((t) => t.id === selected)
  const session = d.sessions.find((s) => s.id === table?.sessionId)
  const bookings = d.reservations.filter((r) => r.tableId === selected)
  return (
    <>
      <PageHeading
        title="Bàn & khu vực"
        description={`${d.tables.length} bàn · ${d.areas.length} khu vực. Theo dõi phiên phục vụ và lịch giữ bàn.`}
        actions={
          <Link className="k-btn" to={managerPath('reservations')}>
            Xem lịch đặt bàn
          </Link>
        }
      />
      <WorkspaceSummary page="tables" />
      <div className="m-toolbar m-toolbar--standalone">
        <Filter
          label="Khu vực"
          value={area}
          onChange={setArea}
          options={[{ value: '', label: 'Tất cả khu vực' }, ...optionsOf(d.areas)]}
        />
        <Filter
          label="Trạng thái bàn"
          value={status}
          onChange={setStatus}
          options={statusOptions(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'OUT_OF_SERVICE'])}
        />
      </div>
      <div className="m-tables-areas">
        {d.areas
          .filter((a) => !area || a.id === area)
          .map((a) => (
            <Panel
              key={a.id}
              title={a.name}
              aside={
                <span className="m-muted">
                  {
                    d.tables.filter((t) => t.areaId === a.id && (!status || t.status === status))
                      .length
                  }{' '}
                  / {d.tables.filter((t) => t.areaId === a.id).length} bàn
                </span>
              }
            >
              <div className="m-table-grid">
                {d.tables
                  .filter((t) => t.areaId === a.id && (!status || t.status === status))
                  .map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className={`m-table-tile m-table-tile--${t.status.toLowerCase()}`}
                    >
                      <div>
                        <strong>{t.code}</strong>
                        <Icon name="users" size={18} />
                      </div>
                      <span>{t.seats} ghế</span>
                      <Status value={t.status} />
                    </button>
                  ))}
              </div>
              {!d.tables.some((t) => t.areaId === a.id && (!status || t.status === status)) && (
                <Empty>Không có bàn phù hợp trong khu vực này.</Empty>
              )}
            </Panel>
          ))}
      </div>
      {table && !editing && (
        <DetailDialog
          title={`Bàn ${table.code}`}
          subtitle={d.areas.find((a) => a.id === table.areaId)?.name}
          entityId={table.id}
          onClose={() => setSelected('')}
          actions={
            user.permissions.includes('tables.edit') ? (
              <Button
                onClick={() => setEditing(true)}
                disabled={
                  !!session ||
                  !!table.sessionId ||
                  table.status === 'CLEANING' ||
                  !!table.hasActiveReservation
                }
              >
                Cập nhật bố trí
              </Button>
            ) : undefined
          }
        >
          <Facts
            items={[
              ['Số ghế', table.seats],
              ['Trạng thái', <Status value={table.status} />],
              ['Phiên phục vụ', session?.id ?? 'Không có'],
              ['Nhân viên', session ? employeeName(d, session.waiterId) : '—'],
              ['Khách tại bàn', session?.guests ?? '—'],
              ['Bắt đầu', session ? time(session.startedAt) : '—'],
            ]}
          />
          {table.hasActiveReservation && user.permissions.includes('tables.edit') && (
            <p className="m-muted">Bàn còn lịch giữ, hãy xử lý đặt bàn trước khi đổi bố trí.</p>
          )}
          {session && (
            <Link className="m-text-link" to={managerPath('orders')}>
              Xem đơn hàng đang phục vụ
            </Link>
          )}
          <div className="m-detail-block">
            <h3>Lịch giữ bàn</h3>
            {bookings.length ? (
              bookings.map((r) => (
                <Link className="m-booking-line" key={r.id} to={managerPath('reservations', r.id)}>
                  {time(r.at)}–{time(r.until)} · {r.customer}
                  <Status value={r.status} />
                </Link>
              ))
            ) : (
              <p className="m-muted">Chưa có lịch đặt liên quan.</p>
            )}
          </div>
        </DetailDialog>
      )}
      {table && editing && (
        <FormDialog
          title={`Bố trí bàn ${table.code}`}
          description="Bàn có phiên phục vụ hoặc lịch giữ phải được xử lý theo quy trình trước khi đổi bố trí."
          initial={{
            seats: String(table.seats),
            areaId: table.areaId,
            inactive: table.status === 'OUT_OF_SERVICE',
          }}
          fields={[
            { key: 'seats', label: 'Số ghế', type: 'number' },
            { key: 'areaId', label: 'Khu vực', type: 'select', options: optionsOf(d.areas) },
            { key: 'inactive', label: 'Tạm ngưng sử dụng bàn', type: 'checkbox' },
          ]}
          onClose={() => setEditing(false)}
          onSubmit={async (v) => {
            const seats = v.seats === '' ? NaN : Number(v.seats)
            const areaId = String(v.areaId ?? '')
            if (!Number.isInteger(seats) || seats < 1 || seats > 20)
              throw new ManagerError('Số ghế phải là số nguyên từ 1 đến 20.', 'seats')
            if (!areaId) throw new ManagerError('Chọn khu vực hợp lệ.', 'areaId')
            try {
              await execute({
                type: 'table.update',
                id: table.id,
                code: table.code,
                seats,
                areaId,
                inactive: !!v.inactive,
              })
            } catch (e) {
              throw e instanceof ApiError && e.status === 409
                ? new Error(
                    'Bàn đang có phiên phục vụ, đang dọn hoặc còn lịch giữ. Hãy xử lý trước khi đổi bố trí.',
                  )
                : e
            }
          }}
        />
      )}
    </>
  )
}
