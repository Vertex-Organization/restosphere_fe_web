import type { Dish, Localized } from '../../../../api/menu/types'
import type { SeatingArea } from '../../../../api/reservations/types'
import type { Language } from '../siteData'

/** Pre-ordered dishes: dish id → portions (or kg for per-kg seafood). */
export type Cart = Record<string, number>

export const AREAS: SeatingArea[] = ['main', 'outdoor', 'private']

export interface PartySet {
  id: string
  imageUrl: string
  badge: Localized
  name: Localized
  guestsLabel: Localized
  guestRange: [min: number, max: number]
  description: Localized
  items: Cart
}

// No party-set endpoint exists; individual dishes come from the server catalog.
export const PARTY_SETS: PartySet[] = []

/** Per-kg seafood is ordered in half kilograms, everything else per portion. */
export const stepOf = (dish: Dish) => (dish.unit === 'kg' ? 0.5 : 1)

export function cartTotal(cart: Cart, dishes: Dish[]) {
  return dishes.reduce((sum, dish) => sum + (cart[dish.id] ?? 0) * dish.price, 0)
}

export function cartCount(cart: Cart) {
  return Object.keys(cart).length
}

/**
 * Estimates how many people the current food dishes in the cart can serve.
 * For `kg` dishes, `serves` in mockData is defined for a standard ~2kg order,
 * so we scale proportionally by quantity / 2.
 */
export function cartGuestCoverage(cart: Cart, dishes: Dish[]): [number, number] {
  let minTotal = 0
  let maxTotal = 0
  for (const dish of dishes) {
    const qty = cart[dish.id]
    if (!qty || !dish.serves) continue
    const factor = dish.unit === 'kg' ? qty / 2 : qty
    minTotal += dish.serves[0] * factor
    maxTotal += dish.serves[1] * factor
  }
  // A typical party guest eats across ~2.5 shared dishes.
  return [Math.max(0, Math.round(minTotal / 2.2)), Math.max(0, Math.round(maxTotal / 2))]
}

export function isSetApplied(cart: Cart, setItems: Cart) {
  const entries = Object.entries(setItems)
  return entries.length > 0 && entries.every(([id, qty]) => (cart[id] ?? 0) >= qty)
}

const money = {
  vi: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
}
export const formatMoney = (value: number, language: Language) => money[language].format(value)

/** "1,5 kg" for per-kg seafood, a plain count for everything else. */
export function formatQuantity(dish: Dish, quantity: number, language: Language) {
  const n = quantity.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-GB')
  return dish.unit === 'kg' ? `${n} kg` : n
}

export const BOOKING_COPY = {
  vi: {
    eyebrow: 'Đặt món trước',
    menuTitle: 'Chọn món cho bàn tiệc',
    menuIntro: 'Chọn nhanh gói thực đơn gợi ý hoặc tự chọn từng món để bếp chuẩn bị chu đáo trước khi bạn đến. Hải sản tính theo kg được đặt theo nửa ký và cân thực tế tại bàn.',
    setsEyebrow: 'Gợi ý nhanh theo quy mô bàn',
    setsTitle: 'Combo bàn tiệc gợi ý',
    setDishCount: (n: number) => `${n} món`,
    moreDishes: (n: number) => `+ ${n} món khác · Xem chi tiết`,
    viewSetDetails: 'Xem chi tiết',
    applySet: 'Áp dụng combo này',
    appliedSet: 'Đã áp dụng',
    perGuest: (amount: string) => `~${amount} / khách`,
    setIncludes: 'Danh sách món trong combo',
    close: 'Đóng',
    food: 'Món ăn',
    drinks: 'Đồ uống',
    all: 'Tất cả',
    searchPlaceholder: 'Tìm nhanh cua, tôm hùm, lẩu, bia…',
    clearSearch: 'Xóa tìm kiếm',
    noSearchMatch: 'Không tìm thấy món phù hợp với từ khóa của bạn.',
    viewDetails: 'Xem chi tiết',
    add: 'Thêm món',
    remove: 'Bớt',
    soldOut: 'Tạm hết',
    serves: (min: number, max: number) => (min === max ? `${min} người` : `${min}–${max} người`),
    selected: (n: number) => `${n} món đã chọn`,
    estimate: 'Tạm tính',
    toBooking: 'Tiếp tục đặt bàn',
    loading: 'Đang tải thực đơn…',
    error: 'Không tải được thực đơn.',
    retry: 'Thử lại',

    bookingEyebrow: 'Đặt bàn & Không gian',
    bookingTitle: 'Giữ bàn cho bữa tiệc của bạn',
    bookingIntro: 'Chọn ngày giờ, số lượng khách và không gian ngồi yêu thích. Nhà hàng sẽ liên hệ xác nhận vị trí bàn cùng thực đơn đặt trước.',
    bookingNote: 'Tiệc từ 20 khách hoặc phòng VIP riêng vui lòng đặt trước ít nhất 1 ngày.',
    date: 'Ngày dùng tiệc',
    time: 'Khung giờ đến',
    lunchSession: 'Ca trưa (10:00 – 14:30)',
    dinnerSession: 'Ca tối (15:00 – 21:30)',
    chooseTime: 'Chọn khung giờ bên dưới',
    noSlots: 'Hôm nay đã hết giờ nhận đặt bàn trực tuyến, vui lòng chọn ngày khác.',
    guests: 'Số lượng khách',
    guestUnit: 'khách',
    fewer: 'Bớt một khách',
    more: 'Thêm một khách',
    recommendPrivate: 'Nhóm từ 8 khách trở lên: Gợi ý chọn Phòng VIP riêng để có không gian kín đáo.',
    switchPrivate: 'Chọn Phòng riêng',
    area: 'Không gian chỗ ngồi',
    areaLabel: { main: 'Sảnh chính', outdoor: 'Sân ngoài trời', private: 'Phòng VIP riêng' } satisfies Record<SeatingArea, string>,
    areaCapacity: { main: '1 – 40 khách', outdoor: '2 – 24 khách', private: '8 – 60 khách' } satisfies Record<SeatingArea, string>,
    areaHint: {
      main: 'Không gian sôi động ngay cạnh bể hải sản tươi sống, thuận tiện chọn hải sản tại chỗ.',
      outdoor: 'Sân vườn thoáng đãng nhiều cây xanh, lý tưởng cho tiệc tối và họp mặt bạn bè.',
      private: 'Phòng máy lạnh khép kín có âm thanh & màn hình riêng cho tiệc sinh nhật, công ty, gia đình.',
    } satisfies Record<SeatingArea, string>,
    areaFeatures: {
      main: ['Cạnh bể hải sản', 'Không khí sôi động'],
      outdoor: ['Thoáng mát tự nhiên', 'View buổi tối đẹp'],
      private: ['Không gian riêng tư', 'Hỗ trợ trang trí & màn chiếu'],
    } satisfies Record<SeatingArea, string[]>,
    step1: 'Thời gian & Không gian tiệc',
    step2: 'Thông tin người đặt & Thực đơn',
    name: 'Họ và tên người đặt',
    namePlaceholder: 'VD: Nguyễn Văn An',
    phone: 'Số điện thoại liên hệ',
    phonePlaceholder: 'VD: 0901 234 567',
    email: 'Email nhận xác nhận (không bắt buộc)',
    emailPlaceholder: 'you@example.com',
    note: 'Ghi chú & yêu cầu đặc biệt',
    notePlaceholder: 'Dị ứng thực phẩm, ghế trẻ em, yêu cầu trang trí sinh nhật, xuất hóa đơn VAT…',
    preorder: 'Thực đơn đặt trước',
    noPreorder: 'Bạn chưa chọn món đặt trước. Bạn có thể gọi món trực tiếp tại bàn hoặc',
    pickDishes: 'chọn món ở phía trên',
    coverageGood: (min: number, max: number) => `Định lượng món ăn hiện tại phù hợp cho khoảng ${min}–${max} khách.`,
    coverageLow: (guests: number) => `Định lượng món hiện tại hơi ít so với bàn ${guests} khách — bạn có thể chọn thêm món dùng chung.`,
    estimatePerGuest: 'Trung bình mỗi khách',
    estimateNote: 'Giá tạm tính chưa gồm phụ thu dịch vụ; hải sản tính theo kg sẽ được cân thực tế tại bàn.',
    clearCart: 'Xóa tất cả món',
    submit: 'Hoàn tất yêu cầu đặt tiệc',
    submitting: 'Đang gửi yêu cầu…',
    failed: 'Chưa gửi được yêu cầu. Vui lòng kiểm tra lại thông tin liên hệ và khung giờ.',
    privateTooSmall: 'Phòng VIP riêng chỉ áp dụng cho đoàn từ 8 khách trở lên.',
    requiredHint: 'Các mục đánh dấu * là thông tin bắt buộc.',

    doneBadge: 'Phiếu Xác Nhận Đặt Tiệc',
    doneTitle: 'Đã ghi nhận yêu cầu đặt bàn!',
    doneText: (code: string) => `Cảm ơn bạn đã chọn The Sea's Crown. Nhân viên lễ tân sẽ gọi lại trong giờ mở cửa để xác nhận bàn mã ${code}.`,
    bookingCodeLabel: 'Mã đặt bàn của bạn',
    copyCode: 'Sao chép mã',
    copiedCode: 'Đã sao chép!',
    doneContact: 'Người đặt',
    doneAgain: 'Tạo yêu cầu đặt bàn mới',
    lookup: 'Tra cứu trạng thái đặt bàn',
    onlineClosed: 'Hệ thống đang tạm ngừng nhận đặt bàn trực tuyến. Vui lòng liên hệ trực tiếp qua số hotline.',
  },
  en: {
    eyebrow: 'Pre-order Menu',
    menuTitle: 'Curate dishes for your table',
    menuIntro: 'Start with a curated party set or hand-pick dishes and quantities so our kitchen is ready when you arrive. Live seafood per kg is ordered in half-kilo steps and weighed at your table.',
    setsEyebrow: 'Quick sets by party size',
    setsTitle: 'Curated Party Set Menus',
    setDishCount: (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'}`,
    moreDishes: (n: number) => `+ ${n} more · View details`,
    viewSetDetails: 'View details',
    applySet: 'Apply this set',
    appliedSet: 'Applied',
    perGuest: (amount: string) => `~${amount} / guest`,
    setIncludes: 'Dishes in this set',
    close: 'Close',
    food: 'Food',
    drinks: 'Drinks',
    all: 'All',
    searchPlaceholder: 'Search king crab, lobster, hotpot, beer…',
    clearSearch: 'Clear search',
    noSearchMatch: 'No dishes match your search query.',
    viewDetails: 'View details',
    add: 'Add dish',
    remove: 'Less',
    soldOut: 'Sold out',
    serves: (min: number, max: number) => (min === max ? `Serves ${min}` : `Serves ${min}–${max}`),
    selected: (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'} selected`,
    estimate: 'Estimated total',
    toBooking: 'Continue to table booking',
    loading: 'Loading the menu…',
    error: 'The menu could not be loaded.',
    retry: 'Try again',

    bookingEyebrow: 'Table & Space Reservation',
    bookingTitle: 'Reserve a space for your occasion',
    bookingIntro: 'Select your preferred date, arrival time, party size and seating zone. Our host team will call back to confirm your table and pre-ordered menu.',
    bookingNote: 'Parties of 20+ guests or VIP private rooms require at least 1 day advance notice.',
    date: 'Event date',
    time: 'Arrival time',
    lunchSession: 'Lunch service (10:00 – 14:30)',
    dinnerSession: 'Dinner service (15:00 – 21:30)',
    chooseTime: 'Select a time slot below',
    noSlots: 'No more online slots available for today. Please choose another date.',
    guests: 'Party size',
    guestUnit: 'guests',
    fewer: 'One guest fewer',
    more: 'One guest more',
    recommendPrivate: 'Party of 8+ guests: We recommend our VIP Private Room for an exclusive dining experience.',
    switchPrivate: 'Switch to Private Room',
    area: 'Seating zone',
    areaLabel: { main: 'Main Hall', outdoor: 'Garden Terrace', private: 'VIP Private Room' } satisfies Record<SeatingArea, string>,
    areaCapacity: { main: '1 – 40 guests', outdoor: '2 – 24 guests', private: '8 – 60 guests' } satisfies Record<SeatingArea, string>,
    areaHint: {
      main: 'Vibrant dining room right beside our live seafood tanks where you can pick your catch.',
      outdoor: 'Breezy open-air terrace with greenery, ideal for evening gatherings and toasts.',
      private: 'Enclosed air-conditioned room with private audio & screen for birthdays, family or corporate events.',
    } satisfies Record<SeatingArea, string>,
    areaFeatures: {
      main: ['Next to live tanks', 'Lively atmosphere'],
      outdoor: ['Open-air breeze', 'Best in the evening'],
      private: ['Full privacy', 'Decor & screen ready'],
    } satisfies Record<SeatingArea, string[]>,
    step1: 'Date, Time & Seating Zone',
    step2: 'Host Details & Pre-order Summary',
    name: 'Host full name',
    namePlaceholder: 'e.g. Alex Nguyen',
    phone: 'Phone number',
    phonePlaceholder: 'e.g. 0901 234 567',
    email: 'Email for confirmation (optional)',
    emailPlaceholder: 'you@example.com',
    note: 'Special requests & notes',
    notePlaceholder: 'Allergies, high chair, birthday table setup, VAT invoice…',
    preorder: 'Pre-ordered menu',
    noPreorder: 'No dishes selected yet. You can order at the table or',
    pickDishes: 'choose dishes above',
    coverageGood: (min: number, max: number) => `Current food portions comfortably cover around ${min}–${max} guests.`,
    coverageLow: (guests: number) => `Current portions may be light for ${guests} guests — consider adding another sharing dish.`,
    estimatePerGuest: 'Estimated per guest',
    estimateNote: 'Estimate excludes service charges; live seafood priced per kg is billed by actual weight at the table.',
    clearCart: 'Clear all dishes',
    submit: 'Confirm booking request',
    submitting: 'Sending request…',
    failed: 'Your request could not be sent. Please check your contact details and time slot.',
    privateTooSmall: 'VIP Private Rooms are reserved for parties of 8 guests or more.',
    requiredHint: 'Fields marked * are required.',

    doneBadge: 'Reservation Pass',
    doneTitle: 'Booking request received!',
    doneText: (code: string) => `Thank you for choosing The Sea's Crown. Our host team will call you during opening hours to confirm reservation ${code}.`,
    bookingCodeLabel: 'Your Reservation Code',
    copyCode: 'Copy code',
    copiedCode: 'Copied!',
    doneContact: 'Reserved by',
    doneAgain: 'Make another reservation',
    lookup: 'Check reservation status',
    onlineClosed: 'Online reservations are temporarily paused. Please contact us directly via our hotline.',
  },
} satisfies Record<Language, unknown>
