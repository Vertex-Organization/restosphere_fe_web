import type { Dish, MenuData } from './types'

// Demonstration menu. Dishes, prices and allergens are placeholders, not the
// restaurant's confirmed menu. Ids that also exist in the kitchen mock
// (src/api/kitchen/mockData.ts) share availability with it.

// One photo style for the whole menu: food shot from above on a light
// surface (4:3), drinks as a single glass on white (1:1). Sources are listed
// in docs/verification/sea-crown/media-sources.md.
const photo = (name: string) => `/sites/sea-crown/images/menu/${name}.jpg`

const categories: MenuData['categories'] = [
  { id: 'signature', group: 'food', name: { vi: 'Đặc sản', en: 'Signature' }, description: { vi: 'Hải sản tươi sống, cân tại bàn theo khối lượng thực tế.', en: 'Live seafood, weighed at your table.' } },
  { id: 'crab-prawn', group: 'food', name: { vi: 'Cua & tôm', en: 'Crab & prawns' } },
  { id: 'squid-fish', group: 'food', name: { vi: 'Mực & cá', en: 'Squid & fish' } },
  { id: 'sharing', group: 'food', name: { vi: 'Món dùng chung', en: 'To share' } },
  { id: 'rice', group: 'food', name: { vi: 'Cơm & mì', en: 'Rice & noodles' } },
  { id: 'hotpot', group: 'food', name: { vi: 'Lẩu', en: 'Hotpot' } },
  { id: 'main', group: 'food', name: { vi: 'Món khác', en: 'Other mains' } },
  { id: 'coffee-tea', group: 'drink', name: { vi: 'Cà phê & trà', en: 'Coffee & tea' } },
  { id: 'juice', group: 'drink', name: { vi: 'Nước ép', en: 'Juices' } },
  { id: 'soft', group: 'drink', name: { vi: 'Bia & nước suối', en: 'Beer & water' } },
]

const steamed = { vi: 'Hấp', en: 'Steamed' }
const grilled = { vi: 'Nướng', en: 'Grilled' }
const saltChili = { vi: 'Rang muối ớt', en: 'Salt & chilli' }
const tamarind = { vi: 'Sốt me', en: 'Tamarind sauce' }
const saltedEgg = { vi: 'Sốt trứng muối', en: 'Salted egg sauce' }
const cheese = { vi: 'Nướng phô mai', en: 'Cheese-baked' }
const garlic = { vi: 'Xào tỏi', en: 'Garlic butter' }

const dishes: Dish[] = [
  {
    id: 'king-crab', categoryId: 'signature', imageUrl: photo('king-crab'), price: 2_490_000, unit: 'kg', serves: [3, 5],
    name: { vi: 'Cua hoàng đế', en: 'King crab' },
    description: { vi: 'Thịt chân cua chắc, ngọt đậm. Một con thường nặng 2–3 kg, phù hợp cho cả bàn cùng thưởng thức.', en: 'Firm, sweet leg meat. One crab usually weighs 2–3 kg and is made for sharing.' },
    preparations: [steamed, cheese, saltChili], tags: ['signature', 'sharing'], allergens: ['shellfish', 'dairy'], pairsWith: ['seafood-rice', 'peach-tea'], status: 'AVAILABLE',
  },
  {
    id: 'lobster', categoryId: 'signature', imageUrl: photo('lobster'), price: 1_890_000, unit: 'kg', serves: [2, 3],
    name: { vi: 'Tôm hùm bông', en: 'Spiny lobster' },
    description: { vi: 'Tôm hùm tươi sống, thịt dai ngọt. Đầu tôm có thể nấu cháo theo yêu cầu.', en: 'Live lobster with sweet, springy meat. The head can be made into congee on request.' },
    preparations: [steamed, cheese, garlic], tags: ['signature'], allergens: ['shellfish', 'dairy'], pairsWith: ['noodles', 'lemonade'], status: 'AVAILABLE',
  },
  {
    id: 'garlic-prawns', categoryId: 'signature', imageUrl: photo('garlic-prawns'), price: 320_000, unit: 'portion', serves: [2, 3],
    name: { vi: 'Tôm sốt tỏi', en: 'Garlic prawns' },
    description: { vi: 'Tôm sú áp chảo với bơ tỏi thơm, chấm cùng bánh mì nướng giòn.', en: 'Tiger prawns pan-fried in garlic butter, served with toasted bread.' },
    tags: ['signature', 'new'], allergens: ['shellfish', 'dairy', 'gluten'], pairsWith: ['steamed-crab'], status: 'AVAILABLE',
  },
  {
    id: 'steamed-crab', categoryId: 'crab-prawn', imageUrl: photo('steamed-crab'), price: 890_000, unit: 'kg', serves: [2, 4],
    name: { vi: 'Cua hấp', en: 'Steamed crab' },
    description: { vi: 'Cua thịt Cà Mau hấp bia, giữ trọn vị ngọt tự nhiên. Có thể chọn cách chế biến khác.', en: 'Mud crab steamed in beer to keep its natural sweetness. Other styles available.' },
    preparations: [steamed, tamarind, saltedEgg, saltChili], tags: ['sharing'], allergens: ['shellfish'], pairsWith: ['seafood-rice', 'orange-juice'], status: 'AVAILABLE',
  },
  {
    id: 'grilled-shrimp', categoryId: 'crab-prawn', imageUrl: photo('grilled-shrimp'), price: 280_000, unit: 'portion', serves: [2, 2], spiceLevel: 1,
    name: { vi: 'Tôm nướng', en: 'Grilled prawns' },
    description: { vi: 'Tôm nướng than hoa, phết sa tế nhẹ, ăn kèm muối ớt xanh.', en: 'Charcoal-grilled prawns brushed with mild chilli oil, with green chilli salt.' },
    preparations: [grilled, saltChili], tags: ['spicy'], allergens: ['shellfish'], status: 'AVAILABLE',
  },
  {
    id: 'grilled-squid', categoryId: 'squid-fish', imageUrl: photo('grilled-squid'), price: 260_000, unit: 'portion', serves: [2, 3], spiceLevel: 1,
    name: { vi: 'Mực nướng', en: 'Grilled squid' },
    description: { vi: 'Mực ống một nắng nướng thơm, thịt giòn ngọt, chấm tương ớt.', en: 'Sun-dried squid grilled until fragrant, with a sweet chilli dip.' },
    preparations: [grilled, saltChili], tags: ['spicy'], allergens: ['shellfish'], status: 'AVAILABLE',
  },
  {
    id: 'steamed-squid', categoryId: 'squid-fish', imageUrl: photo('steamed-squid'), price: 240_000, unit: 'portion', serves: [2, 3],
    name: { vi: 'Mực hấp gừng', en: 'Ginger-steamed squid' },
    description: { vi: 'Mực tươi hấp gừng sả, nhẹ nhàng và giữ vị tự nhiên.', en: 'Fresh squid steamed with ginger and lemongrass, light and clean.' },
    tags: [], allergens: ['shellfish'], status: 'AVAILABLE',
  },
  {
    id: 'grilled-fish', categoryId: 'squid-fish', imageUrl: photo('grilled-fish'), price: 350_000, unit: 'portion', serves: [2, 4],
    name: { vi: 'Cá nướng', en: 'Grilled fish' },
    description: { vi: 'Cá chẽm nguyên con nướng giấy bạc với rau thơm, cuốn bánh tráng.', en: 'Whole sea bass baked in foil with herbs, wrapped in rice paper at the table.' },
    tags: ['sharing'], allergens: ['fish'], status: 'AVAILABLE',
  },
  {
    id: 'seafood-platter', categoryId: 'sharing', imageUrl: photo('seafood-platter'), price: 1_590_000, unit: 'portion', serves: [4, 6],
    name: { vi: 'Mâm hải sản', en: 'Seafood platter' },
    description: { vi: 'Tôm, cua, mực, nghêu và sò điệp trên một mâm, đủ cho nhóm 4–6 người.', en: 'Prawns, crab, squid, clams and scallops on one platter for 4–6 guests.' },
    tags: ['signature', 'sharing'], allergens: ['shellfish', 'fish'], pairsWith: ['peach-tea', 'lemonade'], status: 'AVAILABLE',
  },
  {
    id: 'seafood-ceviche', categoryId: 'sharing', imageUrl: photo('seafood-ceviche'), price: 210_000, unit: 'portion', serves: [2, 3], spiceLevel: 2,
    name: { vi: 'Gỏi hải sản chanh', en: 'Seafood ceviche' },
    description: { vi: 'Tôm, mực tái chanh với hành tím, ớt và rau thơm, chua cay khai vị.', en: 'Lime-cured prawns and squid with shallot, chilli and herbs. A bright starter.' },
    tags: ['spicy', 'new'], allergens: ['shellfish'], status: 'AVAILABLE',
  },
  {
    id: 'seafood-rice', categoryId: 'rice', imageUrl: photo('seafood-rice'), price: 150_000, unit: 'portion', serves: [1, 2],
    name: { vi: 'Cơm chiên hải sản', en: 'Seafood fried rice' },
    description: { vi: 'Cơm chiên tơi với tôm, mực và trứng.', en: 'Fluffy fried rice with prawns, squid and egg.' },
    tags: [], allergens: ['shellfish', 'egg', 'soy'], status: 'AVAILABLE',
  },
  {
    id: 'noodles', categoryId: 'rice', imageUrl: photo('noodles'), price: 140_000, unit: 'portion', serves: [1, 2],
    name: { vi: 'Mì xào hải sản', en: 'Seafood stir-fried noodles' },
    description: { vi: 'Mì trứng xào giòn với hải sản và rau cải.', en: 'Crispy egg noodles stir-fried with seafood and greens.' },
    tags: [], allergens: ['shellfish', 'gluten', 'egg', 'soy'], status: 'AVAILABLE',
  },
  {
    id: 'thai-pot', categoryId: 'hotpot', imageUrl: photo('thai-pot'), price: 450_000, unit: 'portion', serves: [3, 4], spiceLevel: 2,
    name: { vi: 'Lẩu Thái hải sản', en: 'Thai seafood hotpot' },
    description: { vi: 'Nước lẩu chua cay sả, lá chanh với tôm, mực, nghêu và rau.', en: 'Hot and sour lemongrass broth with prawns, squid, clams and vegetables.' },
    tags: ['spicy', 'sharing'], allergens: ['shellfish', 'fish'], status: 'AVAILABLE',
  },
  {
    id: 'old-pot', categoryId: 'hotpot', price: 380_000, unit: 'portion', serves: [3, 4],
    name: { vi: 'Lẩu nấm', en: 'Mushroom hotpot' },
    description: { vi: 'Lẩu nấm thanh ngọt.', en: 'Light mushroom hotpot.' },
    tags: [], allergens: [], status: 'DISCONTINUED',
  },
  {
    id: 'beef', categoryId: 'main', imageUrl: photo('beef'), price: 220_000, unit: 'portion', serves: [1, 2],
    name: { vi: 'Bò lúc lắc', en: 'Shaking beef' },
    description: { vi: 'Thăn bò xào lửa lớn với ớt chuông và hành tây.', en: 'Beef tenderloin seared with peppers and onion.' },
    tags: [], allergens: ['soy'], status: 'AVAILABLE',
  },
  {
    id: 'chicken', categoryId: 'main', imageUrl: photo('chicken'), price: 260_000, unit: 'portion', serves: [2, 3], spiceLevel: 2,
    name: { vi: 'Gà nướng muối ớt', en: 'Salt & chilli roast chicken' },
    description: { vi: 'Gà ta nướng muối ớt, da giòn thơm.', en: 'Free-range chicken roasted with salt and chilli until crisp.' },
    tags: ['spicy'], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'peach-tea', categoryId: 'coffee-tea', imageUrl: photo('peach-tea'), price: 55_000, unit: 'glass',
    name: { vi: 'Trà đào', en: 'Peach iced tea' }, description: { vi: 'Trà đen ủ lạnh với đào miếng và sả.', en: 'Cold-brewed black tea with peach and lemongrass.' },
    tags: [], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'lemonade', categoryId: 'juice', imageUrl: photo('lemonade'), price: 45_000, unit: 'glass',
    name: { vi: 'Nước chanh', en: 'Lemonade' }, description: { vi: 'Chanh tươi vắt, ít đường theo yêu cầu.', en: 'Freshly squeezed, less sugar on request.' },
    tags: [], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'orange-juice', categoryId: 'juice', imageUrl: photo('orange-juice'), price: 60_000, unit: 'glass',
    name: { vi: 'Nước cam', en: 'Orange juice' }, description: { vi: 'Cam sành ép tươi mỗi ngày.', en: 'Pressed fresh every day.' },
    tags: [], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'iced-coffee', categoryId: 'coffee-tea', imageUrl: photo('iced-coffee'), price: 45_000, unit: 'glass',
    name: { vi: 'Cà phê sữa đá', en: 'Vietnamese iced coffee' }, description: { vi: 'Cà phê phin pha với sữa đặc.', en: 'Phin-dripped coffee with condensed milk.' },
    tags: [], allergens: ['dairy'], status: 'AVAILABLE',
  },
  {
    id: 'ginger-tea', categoryId: 'coffee-tea', imageUrl: photo('ginger-tea'), price: 40_000, unit: 'glass',
    name: { vi: 'Trà gừng', en: 'Ginger tea' }, description: { vi: 'Gừng tươi với mật ong, ấm bụng sau bữa hải sản.', en: 'Fresh ginger and honey, warming after seafood.' },
    tags: [], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'water', categoryId: 'soft', imageUrl: photo('water'), price: 20_000, unit: 'bottle',
    name: { vi: 'Nước suối', en: 'Still water' }, description: { vi: 'Chai 500 ml.', en: '500 ml bottle.' },
    tags: [], allergens: [], status: 'AVAILABLE',
  },
  {
    id: 'beer', categoryId: 'soft', imageUrl: photo('beer'), price: 35_000, unit: 'glass',
    name: { vi: 'Bia tươi', en: 'Draught beer' }, description: { vi: 'Bia vàng ướp lạnh, rót tại quầy. Chỉ phục vụ khách từ 18 tuổi.', en: 'Chilled lager poured at the bar. Guests aged 18 and over only.' },
    tags: [], allergens: ['gluten'], status: 'AVAILABLE',
  },
]

export const seedMenu: MenuData = { categories, dishes }
