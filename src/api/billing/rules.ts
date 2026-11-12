import { METHOD_LABEL, PAYMENT_STATUS_LABEL, REQUEST_TYPE_LABEL } from './labels'
import {
  computeTotals, discountAmount, formatVnd, isMoney, MAX_AMOUNT, validateDiscount, withinPercent,
} from './money'
import {
  adjustmentBlock, billView, discountBlock, hasPermission, openShiftOf, paymentBlock, sessionItems, shiftSummary,
  succeededTotal, type BillView,
} from './selectors'
import {
  CashierError,
  type Bill, type CashierCommand, type CashierData, type CashierPermission, type CashierRequest, type CashierStaff,
  type CommandResult, type DiscountInput, type Payment, type RequestType,
} from './types'

// Pure business rules. The mock service runs them locally as if it were the
// backend; once real billing endpoints exist the backend becomes the
// authority (and must re-check totals itself) and these rules only decide
// which actions the UI offers.

export function cloneData(data: CashierData): CashierData {
  return JSON.parse(JSON.stringify(data)) as CashierData
}

export function makeId(data: CashierData, prefix: string) {
  data.nextId += 1
  return `${prefix}${data.nextId}`
}

export const pad = (n: number, size: number) => String(n).padStart(size, '0')

export function nextCode(data: CashierData, kind: keyof CashierData['counters']) {
  data.counters[kind] += 1
  const n = data.counters[kind]
  switch (kind) {
    case 'bill': return `HD${pad(n, 4)}`
    case 'payment': return `GD${pad(n, 4)}`
    case 'request': return `YC-${pad(n, 3)}`
    case 'shift': return `CA-${pad(n, 3)}`
    case 'order': return `K${pad(n, 3)}`
  }
}

export function tableCodeOf(data: CashierData, bill: Bill) {
  const session = data.sessions.find((s) => s.id === bill.sessionId)
  return data.tables.find((t) => t.id === session?.tableId)?.code ?? '—'
}

export function recompute(data: CashierData, bill: Bill) {
  bill.totals = computeTotals(sessionItems(data, bill.sessionId), bill.discount, data.config)
}

export function touch(bill: Bill, at: string, by: string, text: string) {
  bill.version += 1
  bill.history.push({ at, by, text })
}

export function outbox(data: CashierData, at: string, message: { audience: CashierStaff['role']; staffId?: string; title: string; body: string }) {
  data.outbox.unshift({ id: makeId(data, 'out'), at, ...message })
}

/** Marks the bill PAID once verified payments cover the total. The table is not
 * touched: it stays occupied until the waiter confirms the guests left. */
export function settleIfPaid(data: CashierData, bill: Bill, at: string, by: string) {
  const paid = succeededTotal(data.payments.filter((p) => p.billId === bill.id))
  if (bill.status === 'PAID' || paid < bill.totals.total) return false
  bill.status = 'PAID'
  bill.paidAt = at
  bill.history.push({ at, by, text: `Đã thanh toán đủ ${formatVnd(bill.totals.total)}` })
  const session = data.sessions.find((s) => s.id === bill.sessionId)
  outbox(data, at, {
    audience: 'WAITER', staffId: session?.waiterId,
    title: `Bàn ${tableCodeOf(data, bill)} đã thanh toán`,
    body: `${bill.code} · ${formatVnd(bill.totals.total)} · Xác nhận khách rời khi khách ra về.`,
  })
  return true
}

function managers(data: CashierData) {
  return data.staff.filter((s) => s.role === 'MANAGER')
}

function requirePermission(actor: CashierStaff, permission: CashierPermission, message = 'Bạn không có quyền thực hiện thao tác này.') {
  if (!hasPermission(actor, permission)) throw new CashierError('FORBIDDEN', message)
}

function findView(data: CashierData, billId: string): BillView {
  const view = billView(data, billId)
  if (!view) throw new CashierError('NOT_FOUND', 'Không tìm thấy hóa đơn.')
  return view
}

function checkVersion(bill: Bill, version: number) {
  if (bill.version !== version) {
    throw new CashierError('CONFLICT', `Hóa đơn ${bill.code} vừa được cập nhật ở nơi khác. Dữ liệu đã được làm mới, vui lòng kiểm tra lại.`)
  }
}

export function cleanText(text: string, label: string, min = 5, max = 200) {
  const value = text.trim().replace(/\s+/g, ' ')
  if (value.length < min) throw new CashierError('INVALID', `${label} cần ít nhất ${min} ký tự.`)
  if (value.length > max) throw new CashierError('INVALID', `${label} tối đa ${max} ký tự.`)
  return value
}

function checkDiscount(view: BillView, input: DiscountInput) {
  if (input.mode !== 'PERCENT' && input.mode !== 'AMOUNT') throw new CashierError('INVALID', 'Chọn cách giảm giá.')
  const error = validateDiscount(input.mode, input.value, view.bill.totals.subtotal)
  if (error) throw new CashierError('INVALID', error)
  return {
    reason: cleanText(input.reason, 'Lý do giảm giá', 3),
    amount: discountAmount(input, view.bill.totals.subtotal),
  }
}

export function describeDiscount(mode: DiscountInput['mode'], value: number, amount: number) {
  return mode === 'PERCENT' ? `${value}% (${formatVnd(amount)})` : formatVnd(amount)
}

function createRequest(
  data: CashierData, actor: CashierStaff, at: string, bill: Bill, type: RequestType, reason: string,
  extra: Pick<CashierRequest, 'paymentId' | 'itemId' | 'discount'>, detail: string,
) {
  const request: CashierRequest = {
    id: makeId(data, 'req'), code: nextCode(data, 'request'), type, status: 'PENDING', billId: bill.id, reason,
    requestedBy: actor.id, requestedAt: at, ...extra,
  }
  data.requests.unshift(request)
  for (const manager of managers(data)) {
    outbox(data, at, {
      audience: manager.role, staffId: manager.id,
      title: `${request.code}: yêu cầu ${REQUEST_TYPE_LABEL[type].toLowerCase()} · Bàn ${tableCodeOf(data, bill)}`,
      body: `${bill.code} · ${detail} · ${reason} — ${actor.name}`,
    })
  }
  touch(bill, at, actor.id, `Gửi ${request.code}: ${REQUEST_TYPE_LABEL[type].toLowerCase()} (${detail})`)
  return request
}

function finish(data: CashierData, summary: string, ref?: string): CommandResult {
  data.revision += 1
  return { data, summary, ref }
}

function checkAmount(view: BillView, amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new CashierError('INVALID', 'Số tiền thu phải lớn hơn 0.')
  if (amount > view.remaining) {
    throw new CashierError('INVALID', `Số tiền thu không được lớn hơn số còn lại (${formatVnd(view.remaining)}).`)
  }
}

function requirePayable(data: CashierData, view: BillView, actor: CashierStaff) {
  const block = paymentBlock(data, view, actor)
  if (!block) return openShiftOf(data, actor.id)!
  const code = block.code === 'PAID' || block.code === 'TRANSFER_PENDING' || block.code === 'REQUEST_PENDING' ? 'CONFLICT'
    : block.code === 'NO_PERMISSION' ? 'FORBIDDEN' : 'INVALID'
  throw new CashierError(code, block.text)
}

function findPayment(data: CashierData, paymentId: string): Payment {
  const payment = data.payments.find((p) => p.id === paymentId)
  if (!payment) throw new CashierError('NOT_FOUND', 'Không tìm thấy giao dịch.')
  return payment
}

function pendingTransfer(data: CashierData, paymentId: string) {
  const payment = findPayment(data, paymentId)
  if (payment.method !== 'TRANSFER') throw new CashierError('INVALID', 'Giao dịch không phải chuyển khoản.')
  if (payment.status !== 'PENDING') {
    throw new CashierError('CONFLICT', `Giao dịch ${payment.code} đã ở trạng thái ${PAYMENT_STATUS_LABEL[payment.status]}.`)
  }
  const bill = data.bills.find((b) => b.id === payment.billId)
  if (!bill) throw new CashierError('NOT_FOUND', 'Không tìm thấy hóa đơn của giao dịch.')
  return { payment, bill }
}

export function applyCashierCommand(current: CashierData, actorId: string, command: CashierCommand, now: Date): CommandResult {
  const data = cloneData(current)
  // Permissions come from the stored account, never from what the client sends.
  const actor = data.staff.find((s) => s.id === actorId)
  if (!actor || actor.role !== 'CASHIER') {
    throw new CashierError('FORBIDDEN', 'Tài khoản không có quyền thao tác ở quầy thu ngân.')
  }
  const at = now.toISOString()

  switch (command.type) {
    case 'apply-discount': {
      requirePermission(actor, 'discounts.apply', 'Bạn không được áp dụng giảm giá trực tiếp. Hãy gửi yêu cầu để Quản lý duyệt.')
      const view = findView(data, command.billId)
      checkVersion(view.bill, command.billVersion)
      const block = discountBlock(view, actor)
      if (block) throw new CashierError('INVALID', block)
      if (view.bill.discount) throw new CashierError('CONFLICT', 'Hóa đơn đã có giảm giá. Gỡ giảm giá hiện tại trước.')
      const { reason, amount } = checkDiscount(view, command.discount)
      if (!withinPercent(amount, view.bill.totals.subtotal, actor.discountLimitPercent)) {
        throw new CashierError('FORBIDDEN', `Mức giảm vượt hạn mức ${actor.discountLimitPercent}% của bạn. Hãy gửi yêu cầu để Quản lý duyệt.`)
      }
      const bill = view.bill
      bill.discount = { mode: command.discount.mode, value: command.discount.value, reason, appliedBy: actor.id, appliedAt: at }
      recompute(data, bill)
      touch(bill, at, actor.id, `Giảm giá ${describeDiscount(command.discount.mode, command.discount.value, amount)} · ${reason}`)
      return finish(data, `Đã giảm ${formatVnd(amount)} cho ${bill.code} · Còn ${formatVnd(bill.totals.total)}`)
    }

    case 'remove-discount': {
      requirePermission(actor, 'bills.prepare')
      const view = findView(data, command.billId)
      checkVersion(view.bill, command.billVersion)
      if (!view.bill.discount) throw new CashierError('CONFLICT', 'Hóa đơn không có giảm giá.')
      const block = discountBlock(view, actor)
      if (block) throw new CashierError('INVALID', block)
      const bill = view.bill
      delete bill.discount
      recompute(data, bill)
      touch(bill, at, actor.id, 'Gỡ giảm giá')
      return finish(data, `Đã gỡ giảm giá ${bill.code} · Tổng ${formatVnd(bill.totals.total)}`)
    }

    case 'request-discount': {
      requirePermission(actor, 'discounts.request')
      const view = findView(data, command.billId)
      checkVersion(view.bill, command.billVersion)
      const block = discountBlock(view, actor)
      if (block) throw new CashierError('INVALID', block)
      if (view.bill.discount) throw new CashierError('CONFLICT', 'Hóa đơn đã có giảm giá. Gỡ giảm giá hiện tại trước.')
      const { amount } = checkDiscount(view, command.discount)
      const reason = cleanText(command.discount.reason, 'Lý do giảm giá')
      const { mode, value } = command.discount
      const request = createRequest(data, actor, at, view.bill, 'DISCOUNT', reason, { discount: { mode, value, amount } },
        `Giảm ${describeDiscount(mode, value, amount)}`)
      return finish(data, `Đã gửi ${request.code} (giảm ${formatVnd(amount)}) · Chờ Quản lý duyệt`, request.id)
    }

    case 'request-adjustment': {
      requirePermission(actor, 'requests.create')
      const view = findView(data, command.billId)
      const block = adjustmentBlock(view, actor)
      if (block) throw new CashierError('INVALID', block)
      const item = view.items.find((i) => i.id === command.itemId)
      if (!item) throw new CashierError('INVALID', 'Món không thuộc hóa đơn này.')
      if (item.status === 'CANCELLED') throw new CashierError('CONFLICT', `${item.name} đã được hủy khỏi hóa đơn.`)
      const reason = cleanText(command.reason, 'Lý do điều chỉnh')
      const request = createRequest(data, actor, at, view.bill, 'BILL_ADJUSTMENT', reason, { itemId: item.id },
        `Bỏ ${item.quantity} × ${item.name}`)
      return finish(data, `Đã gửi ${request.code} · Chờ Quản lý duyệt điều chỉnh`, request.id)
    }

    case 'request-void': {
      requirePermission(actor, 'requests.create')
      const payment = findPayment(data, command.paymentId)
      if (payment.status !== 'SUCCEEDED') throw new CashierError('INVALID', 'Chỉ yêu cầu hủy giao dịch đã thành công.')
      if (data.requests.some((r) => r.paymentId === payment.id && r.status === 'PENDING')) {
        throw new CashierError('CONFLICT', `Giao dịch ${payment.code} đã có yêu cầu hủy đang chờ duyệt.`)
      }
      const view = findView(data, payment.billId)
      if (view.session.closedAt) {
        throw new CashierError('INVALID', 'Lượt phục vụ đã đóng. Việc hoàn tiền cần Quản lý xử lý theo quy trình riêng.')
      }
      const reason = cleanText(command.reason, 'Lý do hủy thanh toán')
      const request = createRequest(data, actor, at, view.bill, 'PAYMENT_VOID', reason, { paymentId: payment.id },
        `Hủy ${payment.code} · ${METHOD_LABEL[payment.method]} ${formatVnd(payment.amount)}`)
      return finish(data, `Đã gửi ${request.code} · Chờ Quản lý duyệt hủy ${payment.code}`, request.id)
    }

    case 'withdraw-request': {
      const request = data.requests.find((r) => r.id === command.requestId)
      if (!request) throw new CashierError('NOT_FOUND', 'Không tìm thấy yêu cầu.')
      if (request.requestedBy !== actor.id) throw new CashierError('FORBIDDEN', 'Chỉ người gửi mới rút được yêu cầu.')
      if (request.status !== 'PENDING') throw new CashierError('CONFLICT', `${request.code} đã được xử lý.`)
      request.status = 'CANCELLED'
      request.decidedAt = at
      request.decidedBy = actor.id
      const bill = data.bills.find((b) => b.id === request.billId)
      if (bill) touch(bill, at, actor.id, `Rút ${request.code}`)
      for (const manager of managers(data)) {
        outbox(data, at, { audience: manager.role, staffId: manager.id, title: `${request.code} đã được rút`, body: `${actor.name} đã rút yêu cầu.` })
      }
      return finish(data, `Đã rút ${request.code}`, request.id)
    }

    case 'pay-cash':
    case 'create-transfer': {
      // A retried submit (lost response, double click in two tabs) returns the
      // payment already recorded under this key instead of charging again.
      const done = data.processedKeys[command.idempotencyKey]
      if (done) return { data: current, summary: 'Giao dịch này đã được ghi nhận trước đó.', ref: done }
      if (!/^[\w-]{8,64}$/.test(command.idempotencyKey)) throw new CashierError('INVALID', 'Thiếu mã chống trùng giao dịch.')

      const method = command.type === 'pay-cash' ? 'CASH' : 'TRANSFER'
      if (!data.config.methods[method]) throw new CashierError('INVALID', `Nhà hàng chưa bật thanh toán ${METHOD_LABEL[method].toLowerCase()}.`)
      if (method === 'TRANSFER' && !data.config.bank) throw new CashierError('INVALID', 'Chưa cấu hình tài khoản nhận chuyển khoản.')
      requirePermission(actor, 'payments.create', 'Tài khoản không có quyền thu tiền.')
      const view = findView(data, command.billId)
      checkVersion(view.bill, command.billVersion)
      const shift = requirePayable(data, view, actor)
      checkAmount(view, command.amount)

      const payment: Payment = {
        id: makeId(data, 'pay'), code: nextCode(data, 'payment'), billId: view.bill.id, shiftId: shift.id, method,
        status: method === 'CASH' ? 'SUCCEEDED' : 'PENDING', amount: command.amount, createdBy: actor.id, createdAt: at,
      }
      if (command.type === 'pay-cash') {
        if (!isMoney(command.tendered) || command.tendered > MAX_AMOUNT) throw new CashierError('INVALID', 'Số tiền khách đưa không hợp lệ.')
        if (command.tendered < command.amount) {
          throw new CashierError('INVALID', `Khách đưa ${formatVnd(command.tendered)}, thấp hơn số cần thu ${formatVnd(command.amount)}.`)
        }
        payment.tendered = command.tendered
        payment.change = command.tendered - command.amount
        payment.completedAt = at
      } else {
        payment.transferContent = `${view.bill.code} ${payment.code}`
      }
      data.payments.push(payment)
      data.processedKeys[command.idempotencyKey] = payment.id

      const bill = view.bill
      if (method === 'CASH') {
        touch(bill, at, actor.id, `Thu tiền mặt ${formatVnd(payment.amount)} (${payment.code})`)
        const settled = settleIfPaid(data, bill, at, actor.id)
        const change = payment.change ? ` · Trả lại ${formatVnd(payment.change)}` : ''
        return finish(data, `Đã thu ${formatVnd(payment.amount)} tiền mặt · ${bill.code}${change}${settled ? ' · Đã thanh toán đủ' : ''}`, payment.id)
      }
      touch(bill, at, actor.id, `Tạo yêu cầu chuyển khoản ${formatVnd(payment.amount)} (${payment.code})`)
      return finish(data, `Đã tạo yêu cầu chuyển khoản ${formatVnd(payment.amount)} · Chờ tiền về`, payment.id)
    }

    case 'confirm-transfer': {
      requirePermission(actor, 'payments.confirm_transfer',
        'Bạn không có quyền xác nhận thủ công. Chờ ngân hàng xác minh hoặc báo thu ngân chính/Quản lý.')
      const { payment, bill } = pendingTransfer(data, command.paymentId)
      const reference = command.bankReference.trim().toUpperCase()
      if (!/^[A-Z0-9][A-Z0-9./_-]{5,39}$/.test(reference)) {
        throw new CashierError('INVALID', 'Nhập mã giao dịch ngân hàng (6–40 ký tự, chữ không dấu và số).')
      }
      if (data.payments.some((p) => p.bankReference === reference)) {
        throw new CashierError('CONFLICT', `Mã ngân hàng ${reference} đã được dùng cho giao dịch khác.`)
      }
      payment.status = 'SUCCEEDED'
      payment.completedAt = at
      payment.bankReference = reference
      payment.verifiedBy = actor.id
      touch(bill, at, actor.id, `Xác nhận thủ công chuyển khoản ${formatVnd(payment.amount)} (${payment.code}, mã NH ${reference})`)
      const settled = settleIfPaid(data, bill, at, actor.id)
      return finish(data, `Đã xác nhận ${formatVnd(payment.amount)} chuyển khoản · ${bill.code}${settled ? ' · Đã thanh toán đủ' : ''}`, payment.id)
    }

    case 'cancel-transfer': {
      requirePermission(actor, 'payments.create')
      const { payment, bill } = pendingTransfer(data, command.paymentId)
      payment.status = 'CANCELLED'
      payment.completedAt = at
      payment.cancelledBy = actor.id
      touch(bill, at, actor.id, `Hủy yêu cầu chuyển khoản ${payment.code}`)
      return finish(data, `Đã hủy yêu cầu chuyển khoản ${payment.code}`, payment.id)
    }

    case 'open-shift': {
      requirePermission(actor, 'shifts.manage', 'Bạn không có quyền mở ca.')
      const existing = openShiftOf(data, actor.id)
      if (existing) throw new CashierError('CONFLICT', `Bạn đang có ca ${existing.code} mở.`)
      if (!isMoney(command.openingFloat) || command.openingFloat > MAX_AMOUNT) throw new CashierError('INVALID', 'Tiền đầu ca không hợp lệ.')
      const shift = {
        id: makeId(data, 'sh'), code: nextCode(data, 'shift'), cashierId: actor.id, status: 'OPEN' as const,
        openedAt: at, openingFloat: command.openingFloat,
      }
      data.shifts.unshift(shift)
      return finish(data, `Đã mở ca ${shift.code} · Tiền đầu ca ${formatVnd(shift.openingFloat)}`, shift.id)
    }

    case 'close-shift': {
      requirePermission(actor, 'shifts.manage', 'Bạn không có quyền đóng ca.')
      const shift = data.shifts.find((s) => s.id === command.shiftId)
      if (!shift) throw new CashierError('NOT_FOUND', 'Không tìm thấy ca.')
      if (shift.cashierId !== actor.id) throw new CashierError('FORBIDDEN', 'Chỉ thu ngân của ca mới được đóng ca.')
      if (shift.status !== 'OPEN') throw new CashierError('CONFLICT', `Ca ${shift.code} đã đóng.`)
      const summary = shiftSummary(data, shift)
      if (summary.pendingCount) {
        throw new CashierError('INVALID', `Còn ${summary.pendingCount} chuyển khoản đang chờ trong ca. Xác nhận hoặc hủy trước khi đóng ca.`)
      }
      if (!isMoney(command.countedCash) || command.countedCash > MAX_AMOUNT) throw new CashierError('INVALID', 'Nhập số tiền mặt kiểm đếm.')
      const variance = command.countedCash - summary.expectedCash
      const note = command.note.trim()
      if (variance !== 0 && note.length < 5) throw new CashierError('INVALID', 'Có chênh lệch tiền mặt: ghi chú lý do (ít nhất 5 ký tự).')
      shift.status = 'CLOSED'
      shift.closedAt = at
      shift.expectedCash = summary.expectedCash
      shift.countedCash = command.countedCash
      if (note) shift.closingNote = note.slice(0, 300)
      for (const manager of managers(data)) {
        outbox(data, at, {
          audience: manager.role, staffId: manager.id, title: `${actor.name} đã đóng ca ${shift.code}`,
          body: `Doanh thu ${formatVnd(summary.revenue)} · Tiền mặt dự kiến ${formatVnd(summary.expectedCash)} · Kiểm đếm ${formatVnd(command.countedCash)}`,
        })
      }
      const diff = variance === 0 ? 'khớp tiền mặt' : `${variance > 0 ? 'thừa' : 'thiếu'} ${formatVnd(Math.abs(variance))}`
      return finish(data, `Đã đóng ca ${shift.code} · ${diff}`, shift.id)
    }

    case 'read-notifications': {
      const ids = command.ids
      let changed = 0
      for (const notification of data.notifications) {
        if (ids && !ids.includes(notification.id)) continue
        if (notification.readBy.includes(actor.id)) continue
        notification.readBy.push(actor.id)
        changed += 1
      }
      return finish(data, !ids && changed ? `Đã đánh dấu ${changed} thông báo là đã đọc` : '')
    }

    default:
      // Approving requests, freeing tables or serving dishes belong to other roles.
      throw new CashierError('FORBIDDEN', 'Thao tác này không thuộc quyền của Thu ngân.')
  }
}
