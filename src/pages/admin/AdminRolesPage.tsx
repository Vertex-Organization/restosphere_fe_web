import { useMemo, useState, type FormEvent } from 'react'
import { ADMIN_ROLES, type AdminRole, type AdminUser } from '../../api/admin/types'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { useAdminUser } from '../../api/admin/auth'
import { ApiError } from '../../api/client'
import {
  Button,
  DemoNotice,
  Field,
  Icon,
  Modal,
  PageHeader,
  RoleBadge,
} from '../../components/admin/ui'
import { ROLE_LABELS } from '../../components/admin/constants'

const EMPTY_USERS: AdminUser[] = []
const ROLE_ICONS = {
  RECEPTIONIST: 'clipboard',
  WAITER: 'utensils',
  KITCHEN: 'cookingPot',
  CASHIER: 'cash',
  MANAGER: 'board',
  ADMIN: 'checkCircle',
} as const

const ROLE_INFO: Record<AdminRole, { description: string; access: string }> = {
  RECEPTIONIST: {
    description: 'Tiếp nhận và điều phối đặt bàn',
    access: 'Ứng dụng di động (Staff app)',
  },
  WAITER: { description: 'Phục vụ bàn và theo dõi đơn', access: 'Ứng dụng di động (Staff app)' },
  KITCHEN: { description: 'Xử lý món ăn tại bếp', access: 'Kitchen Web' },
  CASHIER: { description: 'Lập hóa đơn và xử lý thanh toán', access: 'Cashier Web' },
  MANAGER: { description: 'Điều phối hoạt động nhà hàng', access: 'Manager Web' },
  ADMIN: { description: 'Quản trị tài khoản và cấu hình hệ thống', access: 'Admin Web' },
}

export default function AdminRolesPage() {
  const { data, execute } = useAdminData()
  const me = useAdminUser()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [userId, setUserId] = useState('')
  const [nextRole, setNextRole] = useState<AdminRole>('WAITER')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const users = data?.users ?? EMPTY_USERS
  const options = useMemo(
    () =>
      users.filter((user) =>
        `${user.fullName} ${user.email}`
          .toLocaleLowerCase('vi')
          .includes(query.toLocaleLowerCase('vi')),
      ),
    [query, users],
  )
  const selected = users.find((user) => user.id === userId)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setStatus('')
    if (!selected) {
      setError('Chọn một tài khoản cần phân quyền.')
      return
    }
    if (selected.id === me?.id) {
      setError('Không thể tự đổi vai trò của mình.')
      return
    }
    if (selected.role === nextRole) {
      setError('Chọn một vai trò khác vai trò hiện tại.')
      return
    }
    if (
      selected.role === 'ADMIN' &&
      users.filter((user) => user.role === 'ADMIN' && user.status === 'ACTIVE').length === 1
    ) {
      setError('Không thể thu hồi quyền của Admin đang hoạt động cuối cùng.')
      return
    }
    try {
      await execute({ type: 'user.role', id: selected.id, role: nextRole })
      setStatus('Đã lưu vai trò.')
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 409
          ? 'Không thể đổi vai trò: tài khoản là Admin hoạt động cuối cùng hoặc đang có bàn/ca làm việc chưa kết thúc.'
          : reason instanceof Error
            ? reason.message
            : 'Không lưu được vai trò.',
      )
    }
  }

  return (
    <>
      <PageHeader
        title="Phân quyền"
        description="Quản lý 7 vai trò đã được định nghĩa trong RestoSphere."
        actions={
          <Button tone="primary" icon="edit" onClick={() => setOpen(true)}>
            Gán vai trò
          </Button>
        }
      />
      <DemoNotice>Quyền truy cập được xác nhận bởi máy chủ.</DemoNotice>
      <div className="a-role-grid">
        {ADMIN_ROLES.map((role) => {
          const count = users.filter((user) => user.role === role).length
          const info = ROLE_INFO[role]
          return (
            <article className="a-role-card" key={role}>
              <div>
                <span className={`a-role-mark a-role-mark--${role.toLowerCase()}`}>
                  <Icon name={ROLE_ICONS[role]} size={18} />
                </span>
                <RoleBadge role={role} />
              </div>
              <h2>{role}</h2>
              <p>{info.description}</p>
              <footer>
                <span>
                  <strong>{count}</strong> tài khoản
                </span>
                <span>{info.access}</span>
              </footer>
            </article>
          )
        })}
      </div>
      <section className="a-panel a-role-note">
        <div>
          <span className="a-note-icon">
            <Icon name="info" size={18} />
          </span>
          <div>
            <h2>Phạm vi phân quyền</h2>
            <p>
              Admin chỉ gán các role có sẵn. Permission matrix, role tùy chỉnh và chính sách truy
              cập động không thuộc phạm vi hiện tại.
            </p>
          </div>
        </div>
      </section>
      {open && (
        <Modal
          title="Gán vai trò tài khoản"
          description="Xem role hiện tại và xác nhận role mới trước khi gửi."
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" form="assign-role" tone="primary">
                Kiểm tra thay đổi
              </Button>
            </>
          }
        >
          <form id="assign-role" className="a-form" onSubmit={submit} noValidate>
            <Field label="Tìm tài khoản">
              <input
                className="a-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setUserId('')
                }}
                placeholder="Tên hoặc email"
              />
            </Field>
            <Field label="Tài khoản">
              <select
                className="a-select"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                <option value="">Chọn tài khoản</option>
                {options.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} · {user.email}
                  </option>
                ))}
              </select>
            </Field>
            {selected && (
              <div className="a-current-role">
                <span>Role hiện tại</span>
                <RoleBadge role={selected.role} />
              </div>
            )}
            <Field label="Vai trò mới">
              <select
                className="a-select"
                value={nextRole}
                onChange={(event) => setNextRole(event.target.value as AdminRole)}
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </Field>
            {nextRole === 'ADMIN' && (
              <p className="a-admin-warning">
                <Icon name="alert" size={16} />
                ADMIN có quyền quản trị cao nhất. Chỉ cấp khi đã xác minh người nhận.
              </p>
            )}
            {error && (
              <p className="a-form-error" role="alert">
                {error}
              </p>
            )}
            {status && (
              <p className="a-inline-warning" role="status">
                {status}
              </p>
            )}
          </form>
        </Modal>
      )}
    </>
  )
}
