import type { Allergen, Dish, DishTag, PriceUnit } from '../../../../api/menu/types'
import type { Language } from '../siteData'

export const TAGS: DishTag[] = ['signature', 'spicy', 'sharing', 'new']
export const ALLERGENS: Allergen[] = ['shellfish', 'fish', 'gluten', 'dairy', 'egg', 'soy']

export type PartySize = 'all' | 'small' | 'medium' | 'large'
export const PARTY_SIZES: PartySize[] = ['all', 'small', 'medium', 'large']
/** Guest ranges each party-size filter matches against a dish's `serves`. */
export const PARTY_RANGE: Record<Exclude<PartySize, 'all'>, [number, number]> = {
  small: [1, 2],
  medium: [3, 4],
  large: [5, 99],
}

export type SortOrder = 'suggested' | 'price-asc' | 'price-desc'
export const SORT_ORDERS: SortOrder[] = ['suggested', 'price-asc', 'price-desc']

export type ViewMode = 'grid' | 'rail'

export const COPY = {
  vi: {
    eyebrow: "THE SEA'S CROWN · FINE SEAFOOD",
    title: 'Thực đơn hải sản',
    intro: 'Khám phá tuyển tập hải sản tươi sống và thức uống tinh tuyển. Chạm vào từng món ăn để xem cách chế biến, khẩu phần và thành phần gây dị ứng.',
    search: 'Tìm món',
    searchPlaceholder: 'Tìm cua, tôm, lẩu, trà…',
    food: 'Thực đơn Món ăn',
    drinks: 'Thực đơn Đồ uống',
    all: 'Tất cả',
    viewGrid: 'Dạng danh mục',
    viewRail: 'Băng chuyền',
    moreFilters: 'Bộ lọc & Sắp xếp',
    features: 'Đặc điểm',
    party: 'Số người',
    partyLabel: { all: 'Tất cả', small: '1–2 người', medium: '3–4 người', large: 'Từ 5 người' } satisfies Record<PartySize, string>,
    avoid: 'Tránh dị ứng',
    sort: 'Sắp xếp',
    sortLabel: { suggested: 'Gợi ý', 'price-asc': 'Giá thấp → cao', 'price-desc': 'Giá cao → thấp' } satisfies Record<SortOrder, string>,
    hideSoldOut: 'Ẩn món tạm hết',
    clear: 'Xóa bộ lọc',
    count: (n: number) => `${n} món`,
    empty: 'Không có món nào khớp với lựa chọn.',
    loading: 'Đang tải thực đơn…',
    error: 'Không tải được thực đơn.',
    retry: 'Thử lại',
    previous: 'Xem món trước',
    next: 'Xem món tiếp theo',
    soldOut: 'Tạm hết',
    soldOutNote: 'Món này đang tạm hết hôm nay. Vui lòng hỏi nhân viên về món thay thế.',
    serves: (min: number, max: number) => (min === max ? `${min} người` : `${min}–${max} người`),
    preparations: 'Cách chế biến',
    allergens: 'Thành phần gây dị ứng',
    noAllergens: 'Không có thành phần gây dị ứng phổ biến.',
    spice: 'Độ cay',
    pairs: 'Gợi ý dùng kèm',
    close: 'Đóng',
    priceNote: 'Giá tham khảo, có thể thay đổi theo mùa. Hải sản tính theo kg được cân tại bàn trước khi chế biến.',
    allergyNote: 'Vui lòng báo nhân viên nếu bạn bị dị ứng; bếp dùng chung dụng cụ cho nhiều món.',
    print: 'Bản in',
    printMenu: 'Thực đơn',
    printDrinks: 'Đồ uống',
  },
  en: {
    eyebrow: "THE SEA'S CROWN · FINE SEAFOOD",
    title: 'Our Seafood Menu',
    intro: 'Explore our curated selection of live seafood and signature drinks. Select any dish to view cooking styles, portions and allergens.',
    search: 'Search dishes',
    searchPlaceholder: 'Search crab, prawns, hotpot, tea…',
    food: 'Food Menu',
    drinks: 'Drinks Menu',
    all: 'All',
    viewGrid: 'By category',
    viewRail: 'Carousel',
    moreFilters: 'Filters & Sort',
    features: 'Features',
    party: 'Party size',
    partyLabel: { all: 'Any', small: '1–2 guests', medium: '3–4 guests', large: '5+ guests' } satisfies Record<PartySize, string>,
    avoid: 'Avoid allergens',
    sort: 'Sort by',
    sortLabel: { suggested: 'Suggested', 'price-asc': 'Price: low → high', 'price-desc': 'Price: high → low' } satisfies Record<SortOrder, string>,
    hideSoldOut: 'Hide sold-out dishes',
    clear: 'Clear filters',
    count: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
    empty: 'Nothing matches your choices.',
    loading: 'Loading the menu…',
    error: 'The menu could not be loaded.',
    retry: 'Try again',
    previous: 'Previous items',
    next: 'Next items',
    soldOut: 'Sold out',
    soldOutNote: 'This dish is sold out today. Please ask our team for an alternative.',
    serves: (min: number, max: number) => (min === max ? `Serves ${min}` : `Serves ${min}–${max}`),
    preparations: 'Cooking styles',
    allergens: 'Allergens',
    noAllergens: 'No common allergens.',
    spice: 'Spice',
    pairs: 'Goes well with',
    close: 'Close',
    priceNote: 'Indicative prices that may change with the season. Seafood priced per kg is weighed at your table before cooking.',
    allergyNote: 'Please tell our team about any allergies; our kitchen shares equipment between dishes.',
    print: 'Printable',
    printMenu: 'Menu',
    printDrinks: 'Drinks',
  },
} satisfies Record<Language, unknown>

export const TAG_LABEL: Record<Language, Record<DishTag, string>> = {
  vi: { signature: 'Đặc sản', spicy: 'Cay', sharing: 'Dùng chung', new: 'Mới' },
  en: { signature: 'Signature', spicy: 'Spicy', sharing: 'To share', new: 'New' },
}

export const ALLERGEN_LABEL: Record<Language, Record<Allergen, string>> = {
  vi: { shellfish: 'Giáp xác', fish: 'Cá', gluten: 'Gluten', dairy: 'Sữa', egg: 'Trứng', soy: 'Đậu nành' },
  en: { shellfish: 'Shellfish', fish: 'Fish', gluten: 'Gluten', dairy: 'Dairy', egg: 'Egg', soy: 'Soy' },
}

const UNIT: Record<Language, Record<PriceUnit, string>> = {
  vi: { portion: '', kg: ' / kg', glass: ' / ly', bottle: ' / chai' },
  en: { portion: '', kg: ' / kg', glass: ' / glass', bottle: ' / bottle' },
}

const money = {
  vi: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
}

export function formatPrice(dish: Dish, language: Language) {
  return money[language].format(dish.price) + UNIT[language][dish.unit]
}


