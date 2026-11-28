import { useState } from 'react'
import { useAdminData } from '../../hooks/admin/AdminDataProvider'
import { ApiError } from '../../api/client'
import { QRCodeSVG } from 'qrcode.react'
import type { AdminSettings, DiscountLimits } from '../../api/admin/types'
import { buildVietQr } from '../../api/billing/vietqr'
import { SelectMenu } from '../../components/shared/SelectMenu'
import { Button, DemoNotice, Icon, PageHeader, SectionCard } from '../../components/admin/ui'

const TWO_DECIMALS = /^\d+(\.\d{1,2})?$/
const MAX_APPROVAL_LIMIT = 999999999999
const vnd = new Intl.NumberFormat('vi-VN')

function DiscountLimitsCard({ source }: { source: DiscountLimits }) {
  const { execute } = useAdminData()
  const toForm = () => ({
    percent: String(source.cashierDiscountPercent),
    limit: String(source.managerApprovalLimit),
  })
  const [form, setForm] = useState(toForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const change = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setMessage('')
  }
  const percent = form.percent === '' ? NaN : Number(form.percent)
  const limit = form.limit === '' ? NaN : Number(form.limit)
  const save = async () => {
    if (!Number.isInteger(percent) || percent < 0 || percent > 100)
      return setMessage('Hạn mức thu ngân là số nguyên từ 0 đến 100.')
    if (!Number.isInteger(limit) || limit < 0 || limit > MAX_APPROVAL_LIMIT)
      return setMessage('Hạn mức Quản lý là số nguyên từ 0 đến 999.999.999.999 đồng.')
    setSaving(true)
    setMessage('')
    try {
      await execute({
        type: 'discountLimits.update',
        limits: { cashierDiscountPercent: percent, managerApprovalLimit: limit },
      })
      setMessage('Đã lưu hạn mức giảm giá.')
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 400) setMessage('Hạn mức chưa hợp lệ.')
      else if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403))
        setMessage('Bạn không có quyền đổi hạn mức.')
      else setMessage(reason instanceof Error ? reason.message : 'Không lưu được hạn mức.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <SectionCard
      icon="percent"
      title="Hạn mức giảm giá"
      description="Áp dụng cho thu ngân và Quản lý. ADMIN không bị giới hạn khi duyệt."
      action={
        <div className="a-page-actions">
          <Button
            disabled={saving}
            onClick={() => {
              setForm(toForm())
              setMessage('')
            }}
          >
            Hủy
          </Button>
          <Button tone="primary" disabled={saving} onClick={save}>
            Lưu hạn mức
          </Button>
        </div>
      }
    >
      <div className="a-setting-row">
        <div>
          <h3>Thu ngân tự giảm tối đa (%)</h3>
          <p>
            Vượt mức này thu ngân phải gửi yêu cầu để Quản lý duyệt. Đặt 0 nếu mọi mức giảm đều cần
            duyệt.
          </p>
        </div>
        <input
          className="a-input"
          type="number"
          min={0}
          max={100}
          step={1}
          aria-label="Thu ngân tự giảm tối đa (%)"
          value={form.percent}
          onChange={(event) => change('percent', event.target.value)}
        />
      </div>
      <div className="a-setting-row">
        <div>
          <h3>Quản lý được duyệt tối đa (đồng / yêu cầu)</h3>
          <p>
            Áp dụng cho giảm giá, hủy món, điều chỉnh hóa đơn và hoàn tiền. Yêu cầu vượt mức chỉ có
            thể bị từ chối.
          </p>
        </div>
        <label className="a-compact-field a-field">
          <span className="a-sr-only">Quản lý được duyệt tối đa (đồng / yêu cầu)</span>
          <input
            className="a-input"
            type="number"
            min={0}
            step={1000}
            value={form.limit}
            onChange={(event) => change('limit', event.target.value)}
          />
          <small>{Number.isFinite(limit) ? `${vnd.format(limit)} ₫` : '—'}</small>
        </label>
      </div>
      {message && (
        <p className="a-inline-warning a-form-message" role="status">
          {message}
        </p>
      )}
    </SectionCard>
  )
}

const BANK_BIN = /^\d{6}$/
const BANK_ACCOUNT = /^\d{6,20}$/

/** Shows the QR a guest would scan at the counter, so a wrong BIN or account is seen before saving. */
function StaticQrPreview({ billing }: { billing: AdminSettings['billing'] }) {
  const payload = buildVietQr({
    bin: billing.bankBin ?? '',
    accountNumber: billing.bankAccount,
  })
  return (
    <div className="a-setting-row">
      <div>
        <h3>Xem trước QR chuyển khoản</h3>
        <p>
          {payload
            ? 'Quét thử bằng ứng dụng ngân hàng để kiểm tra đúng tài khoản nhà hàng.'
            : 'Nhập đủ mã BIN và số tài khoản để xem trước.'}
        </p>
      </div>
      {payload && (
        <QRCodeSVG
          className="a-qr-preview"
          value={payload}
          size={160}
          level="M"
          marginSize={2}
          role="img"
          aria-label="QR chuyển khoản tĩnh của nhà hàng"
        />
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  const { data, execute } = useAdminData()
  const source = data?.settings
  const [settings, setSettings] = useState(() => source)
  const [message, setMessage] = useState('')
  if (!settings || !source) return null
  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current))
    setMessage('')
  }
  const save = async () => {
    if (
      settings.noShowMinutes < 5 ||
      settings.noShowMinutes > 120 ||
      settings.bufferMinutes < 0 ||
      settings.bufferMinutes > 60
    )
      return setMessage('Số phút no-show từ 5 đến 120, số phút đệm từ 0 đến 60.')
    if (
      settings.billing.serviceChargePercent < 0 ||
      settings.billing.serviceChargePercent > 30 ||
      settings.billing.vatPercent < 0 ||
      settings.billing.vatPercent > 20
    )
      return setMessage('Phí dịch vụ từ 0 đến 30%, VAT từ 0 đến 20%.')
    if (
      !TWO_DECIMALS.test(String(settings.billing.serviceChargePercent)) ||
      !TWO_DECIMALS.test(String(settings.billing.vatPercent))
    )
      return setMessage('Phí dịch vụ và VAT chỉ được tối đa 2 chữ số thập phân.')
    if (settings.billing.bankAccount && !BANK_ACCOUNT.test(settings.billing.bankAccount))
      return setMessage('Số tài khoản chỉ gồm chữ số, dài 6 đến 20 ký tự (hoặc để trống).')
    if (settings.billing.bankBin && !BANK_BIN.test(settings.billing.bankBin))
      return setMessage('Mã BIN gồm đúng 6 chữ số (hoặc để trống).')
    try {
      await execute({ type: 'settings.update', settings })
      setMessage('Đã lưu cài đặt.')
    } catch (reason) {
      setMessage(
        reason instanceof ApiError && reason.status === 409
          ? 'Đang có hóa đơn chưa thanh toán nên chưa đổi được phí dịch vụ/VAT. Hãy đổi sau khi các bàn đã thanh toán.'
          : reason instanceof Error
            ? reason.message
            : 'Không lưu được cài đặt.',
      )
    }
  }
  return (
    <>
      <PageHeader
        title="Cài đặt"
        description="Các thiết lập nhỏ gọn phù hợp với tính năng đang tồn tại."
        actions={
          <>
            <Button
              onClick={() => {
                setSettings(source)
                setMessage('')
              }}
            >
              Hủy thay đổi
            </Button>
            <Button tone="primary" onClick={save}>
              Lưu cài đặt
            </Button>
          </>
        }
      />
      <DemoNotice>
        Không có SMTP password hoặc cấu hình bí mật nào được lưu trên trình duyệt.
      </DemoNotice>
      <div className="a-settings-stack">
        <SectionCard
          icon="clipboard"
          title="Đặt bàn trực tuyến"
          description="Customer Web đang có luồng gửi yêu cầu đặt bàn."
        >
          <div className="a-setting-row">
            <div>
              <h3>Nhận yêu cầu đặt bàn</h3>
              <p>Cho phép khách gửi yêu cầu qua biểu mẫu hiện có.</p>
            </div>
            <label className="a-switch">
              <input
                type="checkbox"
                checked={settings.onlineReservations}
                onChange={(event) => update('onlineReservations', event.target.checked)}
              />
              <span aria-hidden="true" />
            </label>
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Thời gian giữ bàn</h3>
              <p>Giá trị hiển thị cho quy trình giữ bàn; cần Backend áp dụng vào nghiệp vụ.</p>
            </div>
            <label className="a-compact-field">
              <span className="a-sr-only">Thời gian giữ bàn</span>
              <SelectMenu
                value={String(settings.tableHoldMinutes)}
                options={[
                  { value: '10', label: '10 phút' },
                  { value: '15', label: '15 phút' },
                  { value: '20', label: '20 phút' },
                  { value: '30', label: '30 phút' },
                ]}
                buttonLabel="Thời gian giữ bàn"
                listLabel="Thời gian giữ bàn"
                onChange={(next) => update('tableHoldMinutes', Number(next))}
              />
            </label>
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Chờ khách trễ (no-show)</h3>
              <p>Sau số phút này lễ tân mới được đánh dấu không đến.</p>
            </div>
            <label className="a-compact-field">
              <span className="a-sr-only">Số phút chờ no-show</span>
              <input
                className="a-input"
                type="number"
                min={5}
                max={120}
                value={settings.noShowMinutes}
                onChange={(event) => update('noShowMinutes', Number(event.target.value))}
              />
            </label>
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Thời gian đệm giữa hai lượt đặt</h3>
              <p>Dùng khi xếp hoặc đổi bàn để tránh trùng giờ.</p>
            </div>
            <label className="a-compact-field">
              <span className="a-sr-only">Số phút đệm</span>
              <input
                className="a-input"
                type="number"
                min={0}
                max={60}
                value={settings.bufferMinutes}
                onChange={(event) => update('bufferMinutes', Number(event.target.value))}
              />
            </label>
          </div>
        </SectionCard>
        <SectionCard
          icon="cash"
          title="Thanh toán"
          description="Giá trị Thu ngân sẽ đọc khi Backend có cấu hình chung."
        >
          <div className="a-setting-row">
            <div>
              <h3>Phí dịch vụ (%)</h3>
            </div>
            <input
              className="a-input"
              type="number"
              min={0}
              max={30}
              aria-label="Phí dịch vụ phần trăm"
              value={settings.billing.serviceChargePercent}
              onChange={(event) =>
                update('billing', {
                  ...settings.billing,
                  serviceChargePercent: Number(event.target.value),
                })
              }
            />
          </div>
          <div className="a-setting-row">
            <div>
              <h3>VAT (%)</h3>
            </div>
            <input
              className="a-input"
              type="number"
              min={0}
              max={20}
              aria-label="VAT phần trăm"
              value={settings.billing.vatPercent}
              onChange={(event) =>
                update('billing', { ...settings.billing, vatPercent: Number(event.target.value) })
              }
            />
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Tài khoản nhận chuyển khoản</h3>
              <p>Chỉ số tài khoản công khai, không nhập mật khẩu.</p>
            </div>
            <input
              className="a-input"
              aria-label="Tài khoản nhận chuyển khoản"
              value={settings.billing.bankAccount}
              onChange={(event) =>
                update('billing', { ...settings.billing, bankAccount: event.target.value })
              }
            />
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Mã BIN ngân hàng</h3>
              <p>6 chữ số theo Napas (ví dụ 970436 cho Vietcombank), dùng để tạo QR tĩnh.</p>
            </div>
            <input
              className="a-input"
              inputMode="numeric"
              maxLength={6}
              aria-label="Mã BIN ngân hàng"
              value={settings.billing.bankBin ?? ''}
              onChange={(event) =>
                update('billing', { ...settings.billing, bankBin: event.target.value })
              }
            />
          </div>
          <StaticQrPreview billing={settings.billing} />
        </SectionCard>
        {data?.discountLimits && <DiscountLimitsCard source={data.discountLimits} />}
        <SectionCard
          icon="bell"
          title="Email thông báo"
          description="Trạng thái tích hợp dịch vụ gửi email."
        >
          <div className="a-integration-state">
            <span>
              <Icon name="offline" size={18} />
            </span>
            <div>
              <h3>SMTP chưa được tích hợp</h3>
              <p>
                Source chưa có API quản trị SMTP an toàn. Cấu hình người gửi và mật khẩu không được
                mở tại Frontend.
              </p>
            </div>
            <strong>Chưa kết nối</strong>
          </div>
          <div className="a-setting-row is-disabled">
            <div>
              <h3>Gửi email thông báo</h3>
              <p>Tùy chọn sẽ khả dụng khi Backend có dịch vụ email.</p>
            </div>
            <label className="a-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                disabled
                onChange={() => undefined}
              />
              <span aria-hidden="true" />
            </label>
          </div>
        </SectionCard>
        <SectionCard
          icon="edit"
          title="Cài đặt chung"
          description="Giá trị hiển thị đang được các module sử dụng."
        >
          <div className="a-setting-row">
            <div>
              <h3>Múi giờ hệ thống</h3>
              <p>Dùng để hiển thị thời gian trong Admin Web.</p>
            </div>
            <SelectMenu
              value={settings.timezone}
              options={[{ value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' }]}
              buttonLabel="Múi giờ hệ thống"
              listLabel="Múi giờ hệ thống"
              onChange={(next) => update('timezone', next)}
            />
          </div>
          <div className="a-setting-row">
            <div>
              <h3>Đơn vị tiền tệ</h3>
              <p>Đồng bộ với dữ liệu thanh toán khi Backend hỗ trợ cấu hình chung.</p>
            </div>
            <SelectMenu
              value={settings.currency}
              options={[{ value: 'VND', label: 'VND' }]}
              buttonLabel="Đơn vị tiền tệ"
              listLabel="Đơn vị tiền tệ"
              onChange={(next) => update('currency', next)}
            />
          </div>
        </SectionCard>
        {message && (
          <p className="a-inline-warning a-form-message" role="status">
            {message}
          </p>
        )}
      </div>
    </>
  )
}
