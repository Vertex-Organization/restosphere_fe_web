import { WorkspaceSummary } from '../../components/manager/WorkspaceSummary'
import { useState } from 'react'
import { dateLabel, time } from '../../api/manager/dates'
import { employeeName } from '../../api/manager/selectors'
import type { Incident } from '../../api/manager/types'
import { useManagerUser } from '../../api/manager/auth'
import { useManagerData } from '../../hooks/manager/ManagerDataProvider'
import {
  Button,
  DataTable,
  DetailDialog,
  Facts,
  Filter,
  FormDialog,
  PageHeading,
  Panel,
  RowAction,
  Search,
  Status,
} from '../../components/manager/ui'
import {
  INCIDENT_TYPE_LABEL,
  incidentTitle,
  matchesSearch,
  optionsOf,
  statusOptions,
} from '../../api/manager/labels'
import { ManagerError } from '../../api/manager/rules'
import { ApiError } from '../../api/client'

export default function IncidentsPage({ selectedId }: { selectedId: string }) {
  const { data: d, execute } = useManagerData()
  const user = useManagerUser()!
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [severity, setSeverity] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(selectedId)
  const [editing, setEditing] = useState(false)
  if (!d) return null
  const rows = d.incidents.filter(
    (i) =>
      matchesSearch(
        query,
        i.code,
        incidentTitle(i),
        i.description,
        i.orderLabel ?? '',
        i.itemName ?? '',
        employeeName(d, i.reporterId),
      ) &&
      (!status || i.status === status) &&
      (!severity || i.severity === severity) &&
      (!type || i.type === type),
  )
  const incident = d.incidents.find((i) => i.id === selected)
  return (
    <>
      <PageHeading
        title="Sự cố"
        description={`${d.incidents.filter((i) => i.status !== 'RESOLVED').length} sự cố đang mở · Phân công người xử lý và theo dõi tiến độ.`}
      />
      <WorkspaceSummary page="incidents" />
      <Panel title="Danh sách sự cố">
        <div className="m-toolbar">
          <Search value={query} onChange={setQuery} placeholder="Tìm sự cố, người báo…" />
          <Filter
            label="Loại sự cố"
            value={type}
            onChange={setType}
            options={[
              { value: '', label: 'Tất cả loại' },
              ...Object.entries(INCIDENT_TYPE_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
          <Filter
            label="Mức độ sự cố"
            value={severity}
            onChange={setSeverity}
            options={statusOptions(['HIGH', 'MEDIUM', 'LOW'], 'Tất cả mức độ')}
          />
          <Filter
            label="Trạng thái sự cố"
            value={status}
            onChange={setStatus}
            options={statusOptions(['OPEN', 'ACKNOWLEDGED', 'RESOLVED'])}
          />
        </div>
        <DataTable
          headers={[
            'Mã · Tiêu đề',
            'Loại',
            'Mức độ',
            'Người báo',
            'Thời gian',
            'Người xử lý',
            'Trạng thái',
            '',
          ]}
          empty={!rows.length}
          count={rows.length}
        >
          {rows.map((i) => (
            <tr
              key={i.id}
              className={
                i.status !== 'RESOLVED' && i.severity === 'HIGH' ? 'm-incident-urgent' : undefined
              }
            >
              <td>
                <strong>{incidentTitle(i)}</strong>
                <small>
                  {i.code}
                  {i.orderLabel ? ` · ${i.orderLabel}` : ''}
                </small>
              </td>
              <td>{INCIDENT_TYPE_LABEL[i.type] ?? i.type}</td>
              <td>
                <Status value={i.severity} />
              </td>
              <td>{employeeName(d, i.reporterId)}</td>
              <td>
                {time(i.at)}
                <small>{dateLabel(i.at)}</small>
              </td>
              <td>{employeeName(d, i.assigneeId ?? '')}</td>
              <td>
                <Status value={i.status} />
              </td>
              <td>
                <RowAction onClick={() => setSelected(i.id)} />
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
      {incident && !editing && (
        <DetailDialog
          title={`${incident.code} · ${incidentTitle(incident)}`}
          entityId={incident.id}
          onClose={() => setSelected('')}
          actions={
            incident.status !== 'RESOLVED' && user.permissions.includes('incidents.manage') ? (
              <Button primary onClick={() => setEditing(true)}>
                Cập nhật & Phản hồi
              </Button>
            ) : undefined
          }
        >
          <Facts
            items={[
              ['Loại sự cố', INCIDENT_TYPE_LABEL[incident.type] ?? incident.type],
              ['Mức độ', <Status value={incident.severity} />],
              ['Người báo', employeeName(d, incident.reporterId)],
              ['Người xử lý', employeeName(d, incident.assigneeId ?? '')],
              [
                'Đơn / Món',
                `${incident.orderLabel ?? '—'}${incident.itemName ? ` / ${incident.itemName}` : ''}`,
              ],
              ['Trạng thái', <Status value={incident.status} />],
            ]}
          />
          <div className="m-detail-block">
            <h3>Mô tả sự cố</h3>
            <p className="m-note">{incident.description}</p>
          </div>
          {incident.response && (
            <div className="m-detail-block">
              <h3>Phản hồi của Quản lý</h3>
              <p className="m-note m-note--response">
                {incident.response.text}
                <br />
                <small className="m-muted">
                  {employeeName(d, incident.response.by)} · {time(incident.response.at)}
                </small>
              </p>
            </div>
          )}
          <p className="m-footnote">
            Đóng sự cố chỉ kết thúc hồ sơ xử lý. Trạng thái đơn, món và hóa đơn được giữ theo quy
            trình nghiệp vụ.
          </p>
        </DetailDialog>
      )}
      {incident && editing && (
        <FormDialog
          title={`Cập nhật & phản hồi ${incident.code} · ${incidentTitle(incident)}`}
          initial={{
            assigneeId: incident.assigneeId ?? '',
            status: incident.status,
            reply: incident.response?.text ?? '',
          }}
          fields={[
            {
              key: 'assigneeId',
              label: 'Người xử lý',
              type: 'select',
              options: [
                { value: '', label: 'Chưa phân công' },
                ...optionsOf(d.employees.filter((e) => e.status === 'ACTIVE')),
              ],
            },
            {
              key: 'status',
              label: 'Tiến độ xử lý',
              type: 'select',
              options: statusOptions(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']).slice(1),
            },
            { key: 'reply', label: 'Trả lời bếp / phục vụ (tùy chọn)', type: 'textarea' },
          ]}
          onClose={() => setEditing(false)}
          onSubmit={async (v) => {
            const assigneeId = String(v.assigneeId ?? '')
            const status = String(v.status) as Incident['status']
            const reply = String(v.reply ?? '').trim()
            const active = (id: string) =>
              d.employees.some((e) => e.id === id && e.status === 'ACTIVE')
            if (assigneeId && !active(assigneeId))
              throw new ManagerError('Chọn người xử lý đang làm việc.', 'assigneeId')
            if (!['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(status))
              throw new ManagerError('Chọn trạng thái hợp lệ.', 'status')
            if (reply && reply.length < 5)
              throw new ManagerError('Nội dung phản hồi cần ít nhất 5 ký tự.', 'reply')
            if (reply.length > 2000)
              throw new ManagerError('Nội dung phản hồi tối đa 2000 ký tự.', 'reply')
            if (status === 'RESOLVED') {
              if (!active(assigneeId || incident.assigneeId || ''))
                throw new ManagerError(
                  'Chọn người xử lý đang làm việc trước khi đóng sự cố.',
                  'assigneeId',
                )
              if (reply.length < 5)
                throw new ManagerError('Nhập cách xử lý ít nhất 5 ký tự để đóng sự cố.', 'reply')
            }
            try {
              await execute({
                type: 'incident.update',
                id: incident.id,
                assigneeId,
                status,
                reply: reply || undefined,
              })
            } catch (e) {
              if (e instanceof ApiError && e.status === 409)
                throw new Error('Sự cố này đã được đóng, không thể sửa nữa.', { cause: e })
              if (e instanceof ApiError && e.status === 400)
                throw new Error(
                  'Dữ liệu chưa hợp lệ: người xử lý phải đang làm việc, phản hồi từ 5 đến 2000 ký tự.',
                  { cause: e },
                )
              throw e
            }
          }}
        />
      )}
    </>
  )
}
