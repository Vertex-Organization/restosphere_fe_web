import { computeTotals, discountAmount, formatVnd, isBillable } from '../../src/api/billing/money'
import type {
  Bill,
  BillEvent,
  BillingConfig,
  CashierData,
  CashierNotification,
  CashierPermission,
  CashierRequest,
  CashierShift,
  CashierStaff,
  DiscountMode,
  MenuEntry,
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RestaurantTable,
  SentItemStatus,
  TableSession,
} from '../../src/api/billing/types'

// Demo data for the cashier workspace. Staff ids, table codes, menu and prices
// match the RestoSphere staff app demo (restosphere-fe-mobile/src/mocks) and
// the kitchen mock, but each module keeps its own store: they are not
// synchronised until a real backend exists. Every bill below is computed from
// its own session's orders, so totals, payments and statuses always agree.

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const pad = (n: number, size: number) => String(n).padStart(size, '0')

/** No VAT or service charge is assumed: the project has not defined them. */
const CONFIG: BillingConfig = {
  restaurantName: "The Sea's Crown",
  serviceChargeRate: null,
  taxRate: null,
  methods: { CASH: true, PAYOS: true, MANUAL_TRANSFER: true },
  bank: {
    bankName: 'Ngân hàng mô phỏng',
    accountNumber: '0123 456 789',
    accountName: 'THE SEAS CROWN DEMO',
  },
}

const CASHIER_ALL: CashierPermission[] = [
  'bills.view',
  'bills.prepare',
  'payments.create',
  'payments.view',
  'payments.confirm_transfer',
  'receipts.print',
  'transactions.view',
  'discounts.apply',
  'discounts.request',
  'requests.create',
  'shifts.view',
  'shifts.manage',
]

const STAFF: CashierStaff[] = [
  {
    id: 'NV020',
    name: 'Ngô Thanh Tâm',
    username: 'cashier',
    role: 'CASHIER',
    position: 'Thu ngân chính',
    permissions: CASHIER_ALL,
    discountLimitPercent: 10,
  },
  {
    id: 'NV021',
    name: 'Hoàng Gia Bảo',
    username: 'cashier2',
    role: 'CASHIER',
    position: 'Thu ngân',
    permissions: CASHIER_ALL.filter(
      (p) => p !== 'discounts.apply' && p !== 'payments.confirm_transfer',
    ),
    discountLimitPercent: 0,
  },
  {
    id: 'NV002',
    name: 'Trần Hoài Nam',
    username: 'waiter',
    role: 'WAITER',
    position: 'Phục vụ',
    permissions: [],
    discountLimitPercent: 0,
  },
  {
    id: 'NV003',
    name: 'Lê Thu Hà',
    username: 'waiter2',
    role: 'WAITER',
    position: 'Phục vụ',
    permissions: [],
    discountLimitPercent: 0,
  },
  {
    id: 'NV001',
    name: 'Vũ Thị Mai',
    username: 'manager',
    role: 'MANAGER',
    position: 'Quản lý ca',
    permissions: [],
    discountLimitPercent: 0,
  },
  {
    id: 'NV010',
    name: 'Phạm Minh Khoa',
    username: 'kitchen',
    role: 'KITCHEN',
    position: 'Bếp trưởng',
    permissions: [],
    discountLimitPercent: 0,
  },
]

// Prices from the staff app menu (restosphere-fe-mobile/src/mocks/waiter-data.ts).
// Photos are the licensed stand-ins the kitchen module already ships (docs/kitchen/menu-photo-credits.md).
const photo = (name: string) => `/kitchen/menu/${name}.jpg`
const MENU: MenuEntry[] = [
  { id: 'grilled-shrimp', name: 'Tôm nướng', price: 219_000, imageUrl: photo('shrimp') },
  { id: 'steamed-crab', name: 'Cua hấp', price: 359_000, imageUrl: photo('crab') },
  { id: 'grilled-squid', name: 'Mực nướng', price: 189_000, imageUrl: photo('squid') },
  { id: 'grilled-fish', name: 'Cá nướng', price: 249_000, imageUrl: photo('fish') },
  { id: 'seafood-rice', name: 'Cơm chiên hải sản', price: 95_000, imageUrl: photo('seafood-rice') },
  { id: 'noodles', name: 'Mì xào hải sản', price: 89_000, imageUrl: photo('noodles') },
  { id: 'thai-pot', name: 'Lẩu Thái', price: 329_000, imageUrl: photo('hotpot') },
  { id: 'beef', name: 'Bò lúc lắc', price: 165_000, imageUrl: photo('beef') },
  { id: 'chicken', name: 'Gà nướng muối ớt', price: 189_000, imageUrl: photo('chicken') },
  { id: 'peach-tea', name: 'Trà đào', price: 35_000, imageUrl: photo('peach-tea') },
  { id: 'water', name: 'Nước suối', price: 15_000 },
]

const AREAS: [prefix: string, area: string, capacities: number[]][] = [
  ['A', 'Tầng 1', [2, 2, 4, 4, 4, 6]],
  ['B', 'Tầng 2', [6, 6, 4, 8, 4]],
  ['G', 'Sân vườn', [2, 6, 4, 4, 6]],
]

interface SeedLine {
  menu: string
  qty: number
  note?: string
  status?: SentItemStatus
  cancel?: string
}
interface SeedRound {
  at: number
  lines: SeedLine[]
}
interface SeedPayment {
  method: PaymentMethod
  /** Defaults to what was still due when it was made. */
  amount?: number
  at: number
  status?: PaymentStatus
  doneAt?: number
  tendered?: number
  bank?: boolean
  failure?: string
  voided?: { at: number; request: number }
}
interface SeedSession {
  bill: number
  table: string
  guests: number
  waiter: string
  opened: number
  requested?: number
  guestLeft?: number
  closed?: number
  rounds: SeedRound[]
  discount?: { mode: DiscountMode; value: number; reason: string; at: number; request?: number }
  payments?: SeedPayment[]
}

const Y = 1440 // minutes in a day: "yesterday" offsets

const SESSIONS: SeedSession[] = [
  // Yesterday, all settled (history and the closed shift).
  {
    bill: 91,
    table: 'A01',
    guests: 4,
    waiter: 'NV002',
    opened: Y + 190,
    requested: Y + 126,
    guestLeft: Y + 112,
    closed: Y + 105,
    rounds: [
      {
        at: Y + 182,
        lines: [
          { menu: 'seafood-rice', qty: 3 },
          { menu: 'beef', qty: 1 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: Y + 120, tendered: 500_000 }],
  },
  {
    bill: 92,
    table: 'B02',
    guests: 4,
    waiter: 'NV003',
    opened: Y + 170,
    requested: Y + 104,
    guestLeft: Y + 92,
    closed: Y + 85,
    rounds: [
      {
        at: Y + 160,
        lines: [
          { menu: 'thai-pot', qty: 1, note: 'Thêm nấm' },
          { menu: 'water', qty: 4 },
        ],
      },
    ],
    payments: [{ method: 'PAYOS', at: Y + 102, doneAt: Y + 100, bank: true }],
  },
  {
    bill: 93,
    table: 'G02',
    guests: 2,
    waiter: 'NV002',
    opened: Y + 150,
    requested: Y + 84,
    guestLeft: Y + 72,
    closed: Y + 66,
    rounds: [
      {
        at: Y + 140,
        lines: [
          { menu: 'grilled-shrimp', qty: 2 },
          { menu: 'peach-tea', qty: 2 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: Y + 80, tendered: 508_000 }],
  },
  {
    bill: 94,
    table: 'A03',
    guests: 2,
    waiter: 'NV003',
    opened: Y + 130,
    requested: Y + 64,
    guestLeft: Y + 50,
    closed: Y + 44,
    rounds: [
      {
        at: Y + 122,
        lines: [
          { menu: 'grilled-fish', qty: 1 },
          { menu: 'noodles', qty: 1 },
        ],
      },
    ],
    payments: [{ method: 'PAYOS', at: Y + 62, doneAt: Y + 60, bank: true }],
  },

  // Earlier today, guests gone and tables cleaned.
  {
    bill: 100,
    table: 'A04',
    guests: 4,
    waiter: 'NV002',
    opened: 170,
    requested: 118,
    guestLeft: 108,
    closed: 100,
    rounds: [
      {
        at: 165,
        lines: [
          { menu: 'seafood-rice', qty: 2 },
          { menu: 'water', qty: 2 },
          { menu: 'beef', qty: 1 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: 112, tendered: 400_000 }],
  },
  {
    bill: 101,
    table: 'A06',
    guests: 3,
    waiter: 'NV003',
    opened: 160,
    requested: 110,
    guestLeft: 98,
    closed: 90,
    rounds: [
      {
        at: 155,
        lines: [
          { menu: 'grilled-fish', qty: 1, note: 'Ít xương' },
          { menu: 'noodles', qty: 1 },
          { menu: 'peach-tea', qty: 2 },
        ],
      },
    ],
    discount: { mode: 'PERCENT', value: 5, reason: 'Khách thân thiết', at: 108 },
    payments: [{ method: 'PAYOS', at: 106, doneAt: 104, bank: true }],
  },
  // A cash payment recorded by mistake, voided through an approved request, then paid by transfer.
  {
    bill: 102,
    table: 'G03',
    guests: 4,
    waiter: 'NV002',
    opened: 150,
    requested: 100,
    guestLeft: 86,
    closed: 80,
    rounds: [
      {
        at: 145,
        lines: [
          { menu: 'thai-pot', qty: 1 },
          { menu: 'water', qty: 3 },
        ],
      },
    ],
    payments: [
      { method: 'CASH', at: 96, tendered: 374_000, voided: { at: 92, request: 1 } },
      { method: 'PAYOS', at: 91, doneAt: 90, bank: true },
    ],
  },
  // Discount above the cashier's limit, approved by the manager; split between cash and transfer.
  {
    bill: 103,
    table: 'B01',
    guests: 6,
    waiter: 'NV002',
    opened: 140,
    requested: 88,
    guestLeft: 70,
    closed: 60,
    rounds: [
      {
        at: 135,
        lines: [
          { menu: 'steamed-crab', qty: 2 },
          { menu: 'grilled-shrimp', qty: 1 },
          { menu: 'peach-tea', qty: 2, note: 'Ít đường' },
        ],
      },
    ],
    discount: {
      mode: 'PERCENT',
      value: 20,
      reason: 'Khách doanh nghiệp, đặt tiệc thường xuyên',
      at: 82,
      request: 2,
    },
    payments: [
      { method: 'CASH', amount: 500_000, at: 78, tendered: 500_000 },
      { method: 'PAYOS', at: 77, doneAt: 76, bank: true },
    ],
  },
  {
    bill: 104,
    table: 'B03',
    guests: 4,
    waiter: 'NV003',
    opened: 125,
    requested: 72,
    guestLeft: 58,
    closed: 50,
    rounds: [
      {
        at: 120,
        lines: [
          { menu: 'noodles', qty: 2 },
          { menu: 'beef', qty: 1 },
          { menu: 'peach-tea', qty: 2 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: 62, tendered: 500_000 }],
  },
  {
    bill: 106,
    table: 'G05',
    guests: 5,
    waiter: 'NV002',
    opened: 110,
    requested: 56,
    guestLeft: 46,
    closed: 40,
    rounds: [
      {
        at: 105,
        lines: [
          { menu: 'steamed-crab', qty: 1 },
          { menu: 'grilled-squid', qty: 1 },
          { menu: 'water', qty: 4 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: 50, tendered: 1_000_000 }],
  },

  // At the restaurant now.
  // B04: three ordering rounds, one bill.
  {
    bill: 105,
    table: 'B04',
    guests: 6,
    waiter: 'NV002',
    opened: 112,
    requested: 7,
    rounds: [
      {
        at: 105,
        lines: [
          { menu: 'seafood-rice', qty: 2, note: 'Không cay' },
          { menu: 'beef', qty: 1 },
          { menu: 'water', qty: 4 },
        ],
      },
      {
        at: 70,
        lines: [
          { menu: 'noodles', qty: 1 },
          { menu: 'peach-tea', qty: 2, note: 'Ít đường' },
        ],
      },
      {
        at: 35,
        lines: [
          { menu: 'steamed-crab', qty: 1 },
          { menu: 'grilled-squid', qty: 1, note: 'Nướng kỹ' },
        ],
      },
    ],
  },
  // G04: discount request above the limit waiting for the manager.
  {
    bill: 107,
    table: 'G04',
    guests: 4,
    waiter: 'NV003',
    opened: 95,
    requested: 14,
    rounds: [
      {
        at: 88,
        lines: [
          { menu: 'steamed-crab', qty: 2 },
          { menu: 'peach-tea', qty: 2, note: 'Không đá' },
        ],
      },
      { at: 50, lines: [{ menu: 'grilled-shrimp', qty: 1 }] },
    ],
  },
  // A02: paid by transfer, guests left, table being cleaned (not available yet).
  {
    bill: 108,
    table: 'A02',
    guests: 2,
    waiter: 'NV003',
    opened: 85,
    requested: 26,
    guestLeft: 15,
    rounds: [
      {
        at: 78,
        lines: [
          { menu: 'grilled-fish', qty: 1 },
          { menu: 'peach-tea', qty: 1 },
        ],
      },
    ],
    payments: [{ method: 'PAYOS', at: 24, doneAt: 22, bank: true }],
  },
  // B02: transfer requested, money not verified yet.
  {
    bill: 109,
    table: 'B02',
    guests: 6,
    waiter: 'NV002',
    opened: 80,
    requested: 5,
    rounds: [
      {
        at: 72,
        lines: [
          { menu: 'steamed-crab', qty: 1 },
          { menu: 'grilled-squid', qty: 1, note: 'Nướng kỹ' },
          { menu: 'water', qty: 2 },
        ],
      },
    ],
    payments: [{ method: 'PAYOS', at: 3, status: 'PENDING' }],
  },
  // A05: one cancelled dish (not billed) and a failed transfer attempt.
  {
    bill: 110,
    table: 'A05',
    guests: 4,
    waiter: 'NV002',
    opened: 75,
    requested: 16,
    rounds: [
      {
        at: 68,
        lines: [
          { menu: 'thai-pot', qty: 1 },
          { menu: 'noodles', qty: 1 },
          { menu: 'chicken', qty: 1, cancel: 'Hết nguyên liệu' },
        ],
      },
    ],
    payments: [
      {
        method: 'PAYOS',
        at: 13,
        status: 'FAILED',
        doneAt: 10,
        failure: 'Quá thời gian chờ, ngân hàng chưa ghi nhận tiền vào tài khoản.',
      },
    ],
  },
  // G01: paid in cash, guests still at the table.
  {
    bill: 111,
    table: 'G01',
    guests: 2,
    waiter: 'NV003',
    opened: 70,
    requested: 12,
    rounds: [
      {
        at: 62,
        lines: [
          { menu: 'grilled-shrimp', qty: 1 },
          { menu: 'grilled-squid', qty: 1 },
        ],
      },
    ],
    payments: [{ method: 'CASH', at: 9, tendered: 500_000 }],
  },
  // A03: the simple case, 355.000đ waiting at the counter.
  {
    bill: 112,
    table: 'A03',
    guests: 4,
    waiter: 'NV002',
    opened: 58,
    requested: 4,
    rounds: [
      {
        at: 50,
        lines: [
          { menu: 'seafood-rice', qty: 2, note: 'Ít cay' },
          { menu: 'beef', qty: 1 },
        ],
      },
    ],
  },
  // Still being served: dishes in the kitchen, no payment request yet.
  {
    bill: 113,
    table: 'G02',
    guests: 5,
    waiter: 'NV003',
    opened: 30,
    rounds: [
      {
        at: 25,
        lines: [
          { menu: 'grilled-shrimp', qty: 3, note: '1 phần không cay' },
          { menu: 'seafood-rice', qty: 1, status: 'PREPARING' },
        ],
      },
    ],
  },
  {
    bill: 114,
    table: 'B05',
    guests: 3,
    waiter: 'NV003',
    opened: 24,
    rounds: [
      {
        at: 20,
        lines: [
          { menu: 'grilled-shrimp', qty: 1, status: 'PREPARING' },
          { menu: 'peach-tea', qty: 1, note: 'Ít đá' },
        ],
      },
    ],
  },
  {
    bill: 115,
    table: 'A01',
    guests: 2,
    waiter: 'NV003',
    opened: 10,
    rounds: [
      {
        at: 6,
        lines: [
          { menu: 'grilled-fish', qty: 1, status: 'SUBMITTED' },
          { menu: 'beef', qty: 1, note: 'Chín vừa', status: 'SUBMITTED' },
        ],
      },
    ],
  },
]

interface SeedRequest {
  n: number
  type: CashierRequest['type']
  bill: number
  at: number
  reason: string
  discount?: { mode: DiscountMode; value: number }
  /** BILL_ADJUSTMENT: [round, line] */
  line?: [number, number]
  /** PAYMENT_VOID: index in the session's payments */
  payment?: number
  decided?: { at: number; approve: boolean; note: string }
}

const REQUESTS: SeedRequest[] = [
  {
    n: 1,
    type: 'PAYMENT_VOID',
    bill: 102,
    payment: 0,
    at: 94,
    reason: 'Khách chuyển khoản, thu ngân ghi nhầm là tiền mặt',
    decided: { at: 92, approve: true, note: 'Đã kiểm két, không có tiền mặt của bàn G03' },
  },
  {
    n: 2,
    type: 'DISCOUNT',
    bill: 103,
    discount: { mode: 'PERCENT', value: 20 },
    at: 85,
    reason: 'Khách doanh nghiệp, đặt tiệc thường xuyên',
    decided: { at: 82, approve: true, note: 'Đồng ý theo chính sách khách doanh nghiệp' },
  },
  {
    n: 3,
    type: 'BILL_ADJUSTMENT',
    bill: 104,
    line: [0, 2],
    at: 70,
    reason: 'Khách báo chỉ gọi 1 ly Trà đào',
    decided: { at: 66, approve: false, note: 'Phục vụ xác nhận bàn đã dùng 2 ly' },
  },
  {
    n: 4,
    type: 'DISCOUNT',
    bill: 107,
    discount: { mode: 'PERCENT', value: 15 },
    at: 9,
    reason: 'Khách thân thiết, tổ chức sinh nhật tại nhà hàng',
  },
]

const CASHIER = 'NV020'
const MANAGER = 'NV001'

export function createSeedData(now: Date): CashierData {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString()

  const tables: RestaurantTable[] = AREAS.flatMap(([prefix, area, capacities]) =>
    capacities.map((capacity, i) => ({
      id: `tbl_${prefix}${pad(i + 1, 2)}`,
      code: `${prefix}${pad(i + 1, 2)}`,
      area,
      capacity,
      status: 'AVAILABLE' as const,
    })),
  )
  const tableId = (code: string) => tables.find((t) => t.code === code)!.id

  const shifts: CashierShift[] = [
    {
      id: 'shift_012',
      code: 'CA-012',
      cashierId: CASHIER,
      status: 'OPEN',
      openedAt: ago(230),
      openingFloat: 2_000_000,
    },
    {
      id: 'shift_011',
      code: 'CA-011',
      cashierId: CASHIER,
      status: 'CLOSED',
      openedAt: ago(Y + 300),
      openingFloat: 2_000_000,
      closedAt: ago(Y + 30),
      countedCash: 2_938_000,
      closingNote: 'Thiếu 20.000đ, đã báo Quản lý ca kiểm tra lại',
    },
  ]

  // Kitchen ticket codes follow submission order across both days.
  const allRounds = SESSIONS.flatMap((s) => s.rounds).sort((a, b) => b.at - a.at)
  const orderCode = new Map(allRounds.map((round, i) => [round, `K${pad(86 + i, 3)}`]))

  const sessions: TableSession[] = []
  const orders: Order[] = []
  const items: OrderItem[] = []
  const bills: Bill[] = []
  const payments: Payment[] = []
  const paymentsBySession = new Map<number, Payment[]>()
  const events = new Map<string, BillEvent[]>()
  const log = (billId: string, minutes: number, by: string, text: string) => {
    const list = events.get(billId) ?? []
    list.push({ at: ago(minutes), by, text })
    events.set(billId, list)
  }

  for (const spec of SESSIONS) {
    const code = pad(spec.bill, 4)
    const session: TableSession = {
      id: `ts_${code}`,
      tableId: tableId(spec.table),
      guests: spec.guests,
      waiterId: spec.waiter,
      openedAt: ago(spec.opened),
      guestLeftAt: spec.guestLeft === undefined ? undefined : ago(spec.guestLeft),
      closedAt: spec.closed === undefined ? undefined : ago(spec.closed),
    }
    sessions.push(session)
    const bill: Bill = {
      id: `bill_${code}`,
      code: `HD${code}`,
      sessionId: session.id,
      status: 'UNPAID',
      version: 1,
      createdAt: session.openedAt,
      totals: { subtotal: 0, discount: 0, serviceCharge: 0, tax: 0, total: 0 },
      history: [],
    }
    log(bill.id, spec.opened, spec.waiter, `Mở bàn · ${spec.guests} khách · tạo hóa đơn`)

    const sessionItems: OrderItem[] = []
    spec.rounds.forEach((round, r) => {
      const ticket = orderCode.get(round)!
      const order: Order = {
        id: `ord_${ticket}`,
        code: ticket,
        sessionId: session.id,
        waiterId: spec.waiter,
        sequence: r + 1,
        submittedAt: ago(round.at),
      }
      orders.push(order)
      round.lines.forEach((line, l) => {
        const menu = MENU.find((m) => m.id === line.menu)!
        const status: SentItemStatus = line.cancel ? 'CANCELLED' : (line.status ?? 'SERVED')
        const item: OrderItem = {
          id: `oi_${ticket}_${l + 1}`,
          orderId: order.id,
          menuItemId: menu.id,
          name: menu.name,
          unitPrice: menu.price,
          quantity: line.qty,
          note: line.note ?? '',
          status,
        }
        if (status === 'SERVED')
          item.servedAt = ago(Math.max(round.at - 15, (spec.requested ?? 1) + 1))
        if (line.cancel) {
          item.cancelledAt = ago(round.at - 3)
          item.cancellationReason = line.cancel
        }
        items.push(item)
        sessionItems.push(item)
      })
      log(
        bill.id,
        round.at,
        spec.waiter,
        `Gửi bếp lượt ${r + 1} (#${ticket}) · ${round.lines.length} món`,
      )
    })

    if (spec.requested !== undefined) {
      bill.status = 'PAYMENT_REQUESTED'
      bill.requestedAt = ago(spec.requested)
      bill.requestedBy = spec.waiter
      log(bill.id, spec.requested, spec.waiter, 'Phục vụ gửi yêu cầu thanh toán')
    }
    if (spec.discount) {
      const d = spec.discount
      bill.discount = {
        mode: d.mode,
        value: d.value,
        reason: d.reason,
        appliedBy: CASHIER,
        appliedAt: ago(d.at),
      }
      if (d.request) {
        bill.discount.requestId = `req_${pad(d.request, 3)}`
        bill.discount.approvedBy = MANAGER
      }
    }
    bill.totals = computeTotals(sessionItems, bill.discount, CONFIG)
    if (spec.discount && !spec.discount.request) {
      log(
        bill.id,
        spec.discount.at,
        CASHIER,
        `Giảm giá ${spec.discount.value}% (${formatVnd(bill.totals.discount)}) · ${spec.discount.reason}`,
      )
    }

    const own: Payment[] = []
    let covered = 0
    for (const p of spec.payments ?? []) {
      const status: PaymentStatus = p.voided ? 'VOIDED' : (p.status ?? 'SUCCEEDED')
      const amount = p.amount ?? bill.totals.total - covered
      const payment: Payment = {
        id: '',
        code: '',
        billId: bill.id,
        shiftId: spec.opened > Y ? 'shift_011' : 'shift_012',
        method: p.method,
        status,
        amount,
        createdBy: CASHIER,
        createdAt: ago(p.at),
      }
      if (p.method === 'CASH') {
        payment.tendered = p.tendered ?? amount
        payment.change = payment.tendered - amount
        payment.completedAt = payment.createdAt
      } else if (status !== 'PENDING') {
        payment.completedAt = ago(p.doneAt ?? p.at)
      }
      if (p.bank) payment.verifiedBy = 'BANK'
      if (p.failure) payment.failureReason = p.failure
      if (p.voided) {
        payment.voidedAt = ago(p.voided.at)
        payment.voidedBy = MANAGER
        payment.voidRequestId = `req_${pad(p.voided.request, 3)}`
      }
      if (status === 'SUCCEEDED') covered += amount
      own.push(payment)
      payments.push(payment)
    }
    paymentsBySession.set(spec.bill, own)

    if (covered >= bill.totals.total && own.length) {
      bill.status = 'PAID'
      const last = own
        .filter((p) => p.status === 'SUCCEEDED')
        .map((p) => p.completedAt!)
        .sort()
        .at(-1)!
      bill.paidAt = last
    }
    if (spec.guestLeft !== undefined)
      log(bill.id, spec.guestLeft, spec.waiter, 'Phục vụ xác nhận khách rời · bàn chuyển Đang dọn')
    if (spec.closed !== undefined)
      log(bill.id, spec.closed, spec.waiter, 'Bàn đã dọn xong · đóng lượt phục vụ')
    bills.push(bill)
  }

  // Transaction codes follow time order.
  payments
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((p, i) => {
      p.code = `GD${pad(201 + i, 4)}`
      p.id = `pay_${pad(201 + i, 4)}`
    })
  for (const p of payments) {
    const bill = bills.find((b) => b.id === p.billId)!
    if (p.method !== 'CASH') {
      p.transferContent = `${bill.code} ${p.code}`
      if (p.status === 'SUCCEEDED')
        p.bankReference = `FT${p.completedAt!.slice(2, 10).replace(/-/g, '')}${p.id.slice(-4)}68`
    }
    const minutes = (iso: string) => (now.getTime() - new Date(iso).getTime()) / 60000
    if (p.method === 'CASH') {
      log(
        bill.id,
        minutes(p.createdAt),
        p.createdBy,
        `Thu tiền mặt ${formatVnd(p.amount)} (${p.code}) · khách đưa ${formatVnd(p.tendered!)}`,
      )
    } else {
      log(
        bill.id,
        minutes(p.createdAt),
        p.createdBy,
        `Tạo yêu cầu chuyển khoản ${formatVnd(p.amount)} (${p.code})`,
      )
      if (p.status === 'SUCCEEDED')
        log(
          bill.id,
          minutes(p.completedAt!),
          'BANK',
          `Ngân hàng xác nhận ${formatVnd(p.amount)} (${p.code})`,
        )
      if (p.status === 'FAILED')
        log(
          bill.id,
          minutes(p.completedAt!),
          'BANK',
          `Chuyển khoản ${p.code} thất bại: ${p.failureReason}`,
        )
    }
    if (p.voidedAt)
      log(
        bill.id,
        minutes(p.voidedAt),
        MANAGER,
        `Hủy ${p.code} theo ${p.voidRequestId?.replace('req_', 'YC-')}`,
      )
  }
  for (const bill of bills) {
    if (bill.paidAt) {
      bill.history.push({
        at: bill.paidAt,
        by: CASHIER,
        text: `Đã thanh toán đủ ${formatVnd(bill.totals.total)}`,
      })
    }
  }

  const requests: CashierRequest[] = REQUESTS.map((spec) => {
    const bill = bills.find((b) => b.code === `HD${pad(spec.bill, 4)}`)!
    const code = `YC-${pad(spec.n, 3)}`
    const request: CashierRequest = {
      id: `req_${pad(spec.n, 3)}`,
      code,
      type: spec.type,
      status: spec.decided ? (spec.decided.approve ? 'APPROVED' : 'REJECTED') : 'PENDING',
      billId: bill.id,
      targetType: 'BILL',
      targetId: bill.id,
      amount: 0,
      reason: spec.reason,
      requestedBy: CASHIER,
      requestedAt: ago(spec.at),
    }
    let detail = ''
    if (spec.discount) {
      const amount = discountAmount(spec.discount, bill.totals.subtotal)
      request.discount = { ...spec.discount, amount }
      request.amount = amount
      detail = `giảm ${spec.discount.value}% (${formatVnd(amount)})`
    }
    if (spec.line) {
      const order = orders.filter((o) => o.sessionId === bill.sessionId)[spec.line[0]]
      const item = items.filter((i) => i.orderId === order.id)[spec.line[1]]
      request.itemId = item.id
      request.targetType = 'ORDER_ITEM'
      request.targetId = item.id
      request.amount = item.unitPrice * item.quantity
      detail = `bỏ ${item.quantity} × ${item.name}`
    }
    if (spec.payment !== undefined) {
      const payment = paymentsBySession.get(spec.bill)![spec.payment]
      request.paymentId = payment.id
      request.targetType = 'PAYMENT'
      request.targetId = payment.id
      request.amount = payment.amount
      detail = `hủy ${payment.code}`
    }
    log(bill.id, spec.at, CASHIER, `Gửi ${code}: ${detail}`)
    if (spec.decided) {
      request.decidedAt = ago(spec.decided.at)
      request.decidedBy = MANAGER
      request.decisionNote = spec.decided.note
      log(
        bill.id,
        spec.decided.at,
        MANAGER,
        `${code} ${spec.decided.approve ? 'được duyệt' : 'bị từ chối'}: ${spec.decided.note}`,
      )
    }
    return request
  }).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  for (const bill of bills) {
    bill.history.push(...(events.get(bill.id) ?? []))
    bill.history.sort((a, b) => a.at.localeCompare(b.at))
    bill.version = bill.history.length
  }

  // A table's state comes from its open session; payment never frees it.
  for (const session of sessions) {
    if (session.closedAt) continue
    const table = tables.find((t) => t.id === session.tableId)!
    table.status = session.guestLeftAt ? 'CLEANING' : 'OCCUPIED'
  }
  tables.find((t) => t.code === 'B03')!.status = 'OUT_OF_SERVICE'

  const yesterday = shifts[1]
  yesterday.expectedCash =
    yesterday.openingFloat +
    payments
      .filter((p) => p.shiftId === yesterday.id && p.method === 'CASH' && p.status === 'SUCCEEDED')
      .reduce((s, p) => s + p.amount, 0)

  const billOf = (n: number) => bills.find((b) => b.code === `HD${pad(n, 4)}`)!
  const tableOf = (bill: Bill) =>
    tables.find((t) => t.id === sessions.find((s) => s.id === bill.sessionId)?.tableId)!.code
  const dishes = (bill: Bill) =>
    items
      .filter(
        (i) =>
          isBillable(i) && orders.some((o) => o.id === i.orderId && o.sessionId === bill.sessionId),
      )
      .reduce((sum, i) => sum + i.quantity, 0)
  const notification = (
    id: number,
    at: number,
    read: boolean,
    n: Omit<CashierNotification, 'id' | 'at' | 'readBy'>,
  ): CashierNotification => ({ id: `n${id}`, at: ago(at), readBy: read ? [CASHIER] : [], ...n })
  const paymentRequest = (id: number, billNo: number, at: number, read: boolean) => {
    const bill = billOf(billNo)
    return notification(id, at, read, {
      kind: 'PAYMENT_REQUEST',
      billId: bill.id,
      title: `Bàn ${tableOf(bill)} yêu cầu thanh toán`,
      body: `${bill.code} · ${dishes(bill)} món · ${formatVnd(bill.totals.total)}`,
    })
  }
  const paymentOf = (billNo: number) => paymentsBySession.get(billNo)!.at(-1)!
  const decided = (id: number, n: number, at: number) => {
    const r = requests.find((x) => x.id === `req_${pad(n, 3)}`)!
    const bill = bills.find((b) => b.id === r.billId)!
    return notification(id, at, true, {
      kind: 'REQUEST_DECIDED',
      billId: bill.id,
      requestId: r.id,
      title: `${r.code} ${r.status === 'APPROVED' ? 'đã được duyệt' : 'bị từ chối'}`,
      body: `${bill.code} · Bàn ${tableOf(bill)} — ${r.decisionNote}`,
    })
  }

  const notifications: CashierNotification[] = [
    paymentRequest(11, 112, 4, false),
    paymentRequest(10, 109, 5, false),
    paymentRequest(9, 105, 7, false),
    notification(8, 10, false, {
      kind: 'TRANSFER_FAILED',
      billId: billOf(110).id,
      paymentId: paymentOf(110).id,
      title: 'Chuyển khoản lỗi · Bàn A05',
      body: `${paymentOf(110).code} · ${paymentOf(110).failureReason}`,
    }),
    paymentRequest(7, 111, 12, true),
    paymentRequest(6, 107, 14, true),
    paymentRequest(5, 110, 16, true),
    notification(4, 22, true, {
      kind: 'TRANSFER_RECEIVED',
      billId: billOf(108).id,
      paymentId: paymentOf(108).id,
      title: `Đã nhận ${formatVnd(paymentOf(108).amount)} · Bàn A02`,
      body: `${paymentOf(108).code} · ${paymentOf(108).transferContent}`,
    }),
    decided(3, 3, 66),
    decided(2, 2, 82),
    decided(1, 1, 92),
  ]

  return {
    schema: 1,
    seedDay: dayKey(now),
    revision: 1,
    nextId: 1000,
    counters: {
      bill: 115,
      payment: 200 + payments.length,
      request: REQUESTS.length,
      shift: 12,
      order: 85 + allRounds.length,
    },
    config: { ...CONFIG, methods: { ...CONFIG.methods }, bank: CONFIG.bank && { ...CONFIG.bank } },
    staff: STAFF.map((s) => ({ ...s, permissions: [...s.permissions] })),
    menu: MENU.map((m) => ({ ...m })),
    tables,
    sessions,
    orders,
    items,
    bills,
    payments,
    requests,
    shifts,
    scheduledShifts: [
      { id: 'SH-AM', name: 'Ca sáng', start: '06:00', end: '14:00', cashierId: CASHIER },
      { id: 'SH-PM', name: 'Ca chiều', start: '14:00', end: '22:00', cashierId: CASHIER },
    ],
    notifications,
    outbox: [],
    processedKeys: {},
  }
}

export function isValidCashierData(value: unknown): value is CashierData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<CashierData>
  const lists = [
    data.staff,
    data.menu,
    data.tables,
    data.sessions,
    data.orders,
    data.items,
    data.bills,
    data.payments,
    data.requests,
    data.shifts,
    data.scheduledShifts,
    data.notifications,
    data.outbox,
  ]
  return (
    data.schema === 1 &&
    typeof data.seedDay === 'string' &&
    Number.isInteger(data.revision) &&
    Number.isInteger(data.nextId) &&
    !!data.config &&
    typeof data.config === 'object' &&
    !!data.counters &&
    typeof data.counters === 'object' &&
    !!data.processedKeys &&
    typeof data.processedKeys === 'object' &&
    lists.every(Array.isArray) &&
    data.bills!.every(
      (b) => b && typeof b.id === 'string' && !!b.totals && Number.isSafeInteger(b.totals.total),
    ) &&
    data.items!.every(
      (i) =>
        i &&
        typeof i.id === 'string' &&
        ['SUBMITTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED', 'CANCELLED', 'VOIDED'].includes(
          i.status,
        ),
    ) &&
    data.payments!.every((p) => p && typeof p.id === 'string' && Number.isSafeInteger(p.amount)) &&
    data.outbox!.every(
      (m) =>
        m &&
        typeof m.id === 'string' &&
        [
          'BILL_UPDATED',
          'PAYMENT',
          'PAYMENT_RETURNED',
          'PAYMENT_VOIDED',
          'APPROVAL',
          'REQUEST_WITHDRAWN',
          'CASHIER_SHIFT_CLOSED',
        ].includes(m.kind),
    )
  )
}
