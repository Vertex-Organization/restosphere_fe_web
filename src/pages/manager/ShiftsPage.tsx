import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { addDays, businessDay, dateLabel, dayAt } from '../../api/manager/dates'
import type { ManagerData, Shift } from '../../api/manager/types'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import {
  Button,
  DataTable,
  FormDialog,
  PageHeading,
  Panel,
  Status,
} from '../../components/manager/ui'
import { ManagerError, overlap } from '../../api/manager/rules'
import { ApiError } from '../../api/client'

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const hoursOf = (s: Pick<Shift, 'date' | 'start' | 'end'>) =>
  (Date.parse(dayAt(s.date, s.end)) - Date.parse(dayAt(s.date, s.start))) / 3600000

// Mirrors the server rules so mistakes are caught before a request; an understaffed shift is allowed on purpose.
function validateShift(d: ManagerData, s: Shift) {
  const fail = (message: string, field: string) => {
    throw new ManagerError(message, field)
  }
  if (!s.name || s.name.length > 100) fail('Nhập tên ca làm, tối đa 100 ký tự.', 'name')
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s.date) ||
    Number.isNaN(Date.parse(dayAt(s.date, '12:00'))) ||
    businessDay(dayAt(s.date, '12:00')) !== s.date
  )
    fail('Chọn ngày làm việc hợp lệ.', 'date')
  if (!HHMM.test(s.start) || !HHMM.test(s.end) || s.start >= s.end)
    fail('Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.', 'end')
  const hours = hoursOf(s)
  if (hours > 12) fail('Một ca không vượt quá 12 giờ.', 'end')
  if (!Number.isInteger(s.minimum) || s.minimum < 1 || s.minimum > 30)
    fail('Nhân sự tối thiểu phải là số nguyên từ 1 đến 30.', 'minimum')
  if (s.employeeIds.length < 1 || s.employeeIds.length > 50)
    fail('Chọn từ 1 đến 50 nhân viên.', 'employeeIds')
  for (const id of s.employeeIds) {
    const e = d.employees.find((e) => e.id === id)
    if (e?.status !== 'ACTIVE')
      fail(`${e?.name ?? id} không còn hoạt động, không thể phân ca.`, 'employeeIds')
    const others = d.shifts.filter(
      (o) => o.id !== s.id && o.date === s.date && o.employeeIds.includes(id),
    )
    // overlap() is strict, so back-to-back shifts (09:00–15:00, 15:00–21:00) pass.
    if (
      others.some((o) =>
        overlap(
          dayAt(s.date, s.start),
          dayAt(s.date, s.end),
          dayAt(o.date, o.start),
          dayAt(o.date, o.end),
        ),
      )
    )
      fail(`${e!.name} đã có ca trùng giờ.`, 'employeeIds')
    if (others.reduce((n, o) => n + hoursOf(o), hours) > 12)
      fail(`${e!.name} vượt 12 giờ trong ngày.`, 'employeeIds')
  }
}

export default function ShiftsPage() {
  const { data: d, execute } = useManagerData()
  const user = useManagerUser()!
  const [startDate, setStartDate] = useState(businessDay())
  const [editing, setEditing] = useState<Shift | null>(null)
  if (!d) return null
  const canManage = user.permissions.includes('shifts.manage')
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
  const shifts = d.shifts
    .filter((s) => days.includes(s.date))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
  const create = () =>
    setEditing({
      id: '',
      name: '',
      date: startDate,
      start: '09:00',
      end: '15:00',
      employeeIds: [],
      minimum: 6,
    })
  return (
    <>
      <PageHeading
        title="Nhân viên & ca làm"
        description="Lịch 7 ngày, phân công nhân sự và kiểm tra ca trùng trước khi lưu."
        actions={
          canManage && (
            <Button primary icon="plusCircle" onClick={create}>
              Tạo ca làm
            </Button>
          )
        }
      />
      <WorkspaceSummary page="shifts" />
      <Panel
        title="Lịch ca trong tuần"
        aside={
          <span className="m-muted">
            {dateLabel(dayAt(startDate, '12:00'))} – {dateLabel(dayAt(days[6], '12:00'))}
          </span>
        }
      >
        <div className="m-toolbar">
          <Button icon="chevronLeft" onClick={() => setStartDate(addDays(startDate, -7))}>
            Tuần trước
          </Button>
          <Button onClick={() => setStartDate(businessDay())}>Về hôm nay</Button>
          <Button icon="chevronRight" onClick={() => setStartDate(addDays(startDate, 7))}>
            Tuần sau
          </Button>
        </div>
        <div className="m-week-scroll">
          <div className="m-week-grid">
            {days.map((day) => (
              <div
                key={day}
                className={day === businessDay() ? 'm-week-day is-today' : 'm-week-day'}
              >
                <h3>
                  {new Intl.DateTimeFormat('vi-VN', {
                    weekday: 'short',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  }).format(new Date(dayAt(day, '12:00')))}
                  <span>
                    {day.slice(8)}/{day.slice(5, 7)}
                  </span>
                </h3>
                {shifts
                  .filter((s) => s.date === day)
                  .map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      className="m-shift-cell"
                      disabled={!canManage}
                      onClick={() => setEditing(s)}
                    >
                      <strong>{s.name}</strong>
                      <small>
                        {s.start}–{s.end}
                      </small>
                      <span>{s.employeeIds.length} nhân viên</span>
                      {s.employeeIds.length < s.minimum && (
                        <em>Thiếu {s.minimum - s.employeeIds.length} người</em>
                      )}
                    </button>
                  ))}
                {!shifts.some((s) => s.date === day) && (
                  <p className="m-inline-empty">Chưa có ca</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="Nhân sự theo ca">
        <DataTable
          headers={['Ngày', 'Ca làm', 'Thời gian', 'Nhân viên', 'Định biên', '']}
          empty={!shifts.length}
        >
          {shifts.map((s) => (
            <tr key={s.id}>
              <td>
                {s.date.slice(8)}/{s.date.slice(5, 7)}
              </td>
              <td>
                <strong>{s.name}</strong>
              </td>
              <td>
                {s.start}–{s.end}
              </td>
              <td className="m-staff-names">
                {s.employeeIds.map((id) => d.employees.find((e) => e.id === id)?.name).join(', ')}
              </td>
              <td>
                <Status
                  value={s.employeeIds.length < s.minimum ? 'PENDING' : 'AVAILABLE'}
                  label={`${s.employeeIds.length}/${s.minimum} người`}
                />
              </td>
              <td>{canManage && <Button onClick={() => setEditing(s)}>Điều chỉnh ca</Button>}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      {editing && (
        <FormDialog
          title={editing.name ? `Điều chỉnh ${editing.name}` : 'Tạo ca làm'}
          description="Ca trong ngày, tối đa 12 giờ/ca và 12 giờ/người/ngày; không trùng giờ. Có thể lưu ca chưa đủ người."
          initial={{
            name: editing.name,
            date: editing.date,
            start: editing.start,
            end: editing.end,
            minimum: String(editing.minimum),
            employeeIds: editing.employeeIds,
          }}
          fields={[
            { key: 'name', label: 'Tên ca' },
            { key: 'date', label: 'Ngày làm việc', type: 'date' },
            { key: 'start', label: 'Giờ bắt đầu', type: 'time' },
            { key: 'end', label: 'Giờ kết thúc', type: 'time' },
            { key: 'minimum', label: 'Nhân sự tối thiểu', type: 'number' },
            {
              key: 'employeeIds',
              label: 'Nhân viên trong ca',
              type: 'multiselect',
              options: d.employees.map((e) => ({
                value: e.id,
                label: `${e.name} · ${e.position}${e.status !== 'ACTIVE' ? ' (không thể phân ca)' : ''}`,
                disabled: e.status !== 'ACTIVE',
              })),
            },
          ]}
          onClose={() => setEditing(null)}
          onSubmit={async (v) => {
            const shift: Shift = {
              ...editing,
              name: String(v.name).trim(),
              date: String(v.date),
              start: String(v.start),
              end: String(v.end),
              minimum: v.minimum === '' ? NaN : Number(v.minimum),
              employeeIds: [...new Set(v.employeeIds as string[])],
            }
            validateShift(d, shift)
            try {
              await execute({ type: 'shift.save', shift })
            } catch (e) {
              throw e instanceof ApiError && e.status === 409
                ? new ManagerError(
                    'Không lưu được ca: có nhân viên bị khóa, trùng ca hoặc vượt 12 giờ trong ngày.',
                    'employeeIds',
                  )
                : e
            }
          }}
          submitLabel="Lưu ca làm"
        />
      )}
    </>
  )
}
