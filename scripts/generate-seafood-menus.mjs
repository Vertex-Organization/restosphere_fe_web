import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'

const output = new URL('../public/sites/sea-crown/menus/', import.meta.url)
const fonts = new URL('../public/sites/sea-crown/fonts/', import.meta.url)
mkdirSync(output, { recursive: true })

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const embeddedFont = name => readFileSync(new URL(name, fonts)).toString('base64')
const fontCss = `@font-face{font-family:Menu;src:url(data:font/ttf;base64,${embeddedFont('BeVietnamPro-Regular.ttf')})} @font-face{font-family:Menu;src:url(data:font/ttf;base64,${embeddedFont('BeVietnamPro-Bold.ttf')});font-weight:700}`

const copy = {
  vi: {
    menu: 'THỰC ĐƠN HẢI SẢN', tagline: 'Hương vị biển cả, sẻ chia cùng nhau',
    signature: 'ĐẶC SẢN NỔI BẬT',
    dishes: [
      ['Cua hoàng đế', 'Thịt cua chắc ngọt, cùng cả bàn thưởng thức hương vị biển cả.'],
      ['Tôm hùm', 'Vị ngọt đặc trưng, dành cho những bữa ăn và dịp sum họp đặc biệt.'],
      ['Tôm sốt tỏi', 'Tôm ngọt thịt hòa cùng hương tỏi thơm, đậm đà và dễ thưởng thức.'],
    ],
    crab: 'CUA & TÔM', squid: 'MỰC & MÓN CHIA SẺ',
    crabDishes: [['Cua hấp', 'Thưởng thức vị ngọt tự nhiên của thịt cua.'], ['Cua sốt', 'Hương vị đậm đà cho bữa ăn thêm trọn vẹn.'], ['Tôm nướng', 'Thơm lừng, dùng cùng cả gia đình.']],
    squidDishes: [['Mực nướng', 'Hương nướng thơm, thịt mực giòn ngọt.'], ['Mực hấp', 'Nhẹ nhàng, giữ hương vị tự nhiên.'], ['Hải sản dùng chung', 'Cùng chọn món theo sở thích của cả bàn.']],
    together: 'CHỌN MÓN CHO CẢ BÀN',
    togetherText: 'Kết hợp cua, tôm, mực hoặc tôm hùm cho bữa ăn gia đình, cuộc hẹn bạn bè và những dịp gặp gỡ. Hãy chia sẻ số khách và sở thích để được tư vấn khẩu phần phù hợp.',
    details: 'TRƯỚC KHI ĐẶT MÓN',
    detailsText: 'Vui lòng liên hệ nhà hàng để xác nhận món đang phục vụ, khẩu phần, trọng lượng và giá trước khi đặt. Thông báo các loại dị ứng và yêu cầu ăn uống để được trao đổi trước khi chọn món.',
    drinks: 'ĐỒ UỐNG', hot: 'CÀ PHÊ & TRÀ', cold: 'ĐỒ UỐNG MÁT',
    hotDrinks: ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Trà gừng', 'Trà bạc hà'],
    coldDrinks: ['Nước chanh', 'Nước cam', 'Nước ép trái cây', 'Cà phê đá', 'Nước giải khát'],
    drinkNote: 'Chọn đồ uống theo sở thích để bữa ăn thêm trọn vẹn.',
    confirm: 'Vui lòng hỏi nhà hàng về lựa chọn và giá đang áp dụng.',
    event: 'THỰC ĐƠN ĐẶT TIỆC', eventTag: 'Một bàn tiệc, nhiều khoảnh khắc đáng nhớ',
    eventSections: [
      ['BẮT ĐẦU TỪ MÓN BẠN YÊU THÍCH', 'Cua, tôm, mực, tôm hùm và cua hoàng đế là những gợi ý để cùng nhau xây dựng thực đơn cho bữa tiệc.'],
      ['LỰA CHỌN THEO SỐ KHÁCH', 'Chia sẻ số khách, các món yêu thích và cách chế biến mong muốn để trao đổi về khẩu phần cho cả bàn.'],
      ['DÀNH CHO DỊP SUM HỌP', 'Sinh nhật, họp mặt gia đình, liên hoan và gặp gỡ đối tác. Mỗi dịp có một cách chọn món phù hợp.'],
      ['CÙNG TRAO ĐỔI TRƯỚC KHI XÁC NHẬN', 'Gửi ngày dự kiến, địa điểm và thông tin liên hệ. Nhà hàng sẽ trao đổi thực đơn, số khách và chi phí trước khi xác nhận.'],
    ],
    eventCta: 'Liên hệ nhà hàng hoặc gửi yêu cầu tại trang Đặt tiệc.',
  },
  en: {
    menu: 'SEAFOOD MENU', tagline: 'Flavours of the sea, made for sharing',
    signature: 'SIGNATURE SEAFOOD',
    dishes: [
      ['King crab', 'Sweet, firm crab meat to share around the table.'],
      ['Lobster', 'Distinctively sweet seafood for memorable meals and special gatherings.'],
      ['Garlic prawns', 'Sweet prawns with fragrant garlic and a rich, savoury flavour.'],
    ],
    crab: 'CRAB & PRAWNS', squid: 'SQUID & SHARING DISHES',
    crabDishes: [['Steamed crab', 'Enjoy the natural sweetness of crab meat.'], ['Crab in sauce', 'Rich flavours to share over a meal.'], ['Grilled prawns', 'Fragrant seafood to enjoy with the family.']],
    squidDishes: [['Grilled squid', 'A smoky aroma and a gently firm bite.'], ['Steamed squid', 'A simple way to enjoy its natural flavour.'], ['Seafood to share', 'Choose dishes to suit everyone at the table.']],
    together: 'CHOOSING FOR THE TABLE',
    togetherText: 'Combine crab, prawns, squid or lobster for a family meal, an evening with friends or a special gathering. Share your guest count and preferences to discuss suitable portions.',
    details: 'BEFORE YOU ORDER',
    detailsText: 'Please contact the restaurant to confirm availability, portions, weight and prices before ordering. Tell our team about allergies and dietary requirements before choosing your dishes.',
    drinks: 'DRINKS', hot: 'COFFEE & TEA', cold: 'COLD DRINKS',
    hotDrinks: ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Ginger tea', 'Mint tea'],
    coldDrinks: ['Lemonade', 'Orange juice', 'Fruit juice', 'Iced coffee', 'Soft drinks'],
    drinkNote: 'Choose a drink to complement your seafood meal.',
    confirm: 'Ask the restaurant about current choices and prices.',
    event: 'SEAFOOD EVENT MENU', eventTag: 'One shared table, many memorable moments',
    eventSections: [
      ['START WITH YOUR FAVOURITE SEAFOOD', 'Crab, prawns, squid, lobster and king crab are starting points for planning a menu together.'],
      ['PLAN FOR YOUR GROUP', 'Share your guest count, favourite dishes and preferred preparation styles to discuss portions for the table.'],
      ['FOR SHARED OCCASIONS', 'Birthdays, family gatherings, team celebrations and business meals. Choose dishes that suit your occasion.'],
      ['DISCUSS THE DETAILS BEFORE CONFIRMING', 'Send your preferred date, location and contact details. The restaurant will discuss the menu, guest count and costs before confirming.'],
    ],
    eventCta: 'Contact the restaurant or send an enquiry on the Catering page.',
  },
}

function document(width, height, language, title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xml:lang="${language}" role="img"><title>${escape(title)} — The Sea's Crown</title><defs><style>${fontCss}</style></defs><rect width="100%" height="100%" fill="#fff"/><g font-family="Menu, sans-serif" fill="#870000">${content}</g></svg>`
}

function text(value, x, y, size = 28, bold = false, anchor = 'start') {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${bold ? 700 : 400}" text-anchor="${anchor}">${escape(value)}</text>`
}

function paragraph(value, x, y, maxCharacters = 68, size = 27, lineHeight = 43) {
  const words = value.split(/\s+/)
  const lines = []
  let current = ''
  for (const word of words) {
    if (current && `${current} ${word}`.length > maxCharacters) { lines.push(current); current = word }
    else current = current ? `${current} ${word}` : word
  }
  if (current) lines.push(current)
  return lines.map((line, index) => text(line, x, y + index * lineHeight, size)).join('')
}

function line(x, y, width) {
  return `<rect x="${x}" y="${y}" width="${width}" height="4" fill="#ffc400"/>`
}

function header(title, subtitle) {
  return text("The Sea's Crown", 744.5, 110, 58, true, 'middle') + text(title, 744.5, 177, 37, true, 'middle') + text(subtitle, 744.5, 229, 26, false, 'middle') + line(90, 270, 1309)
}

for (const [language, c] of Object.entries(copy)) {
  let menu = header(c.menu, c.tagline) + text(c.signature, 90, 355, 39, true)
  for (const [index, [name, description]] of c.dishes.entries()) {
    const y = 440 + index * 160
    menu += text(name, 90, y, 39, true) + paragraph(description, 90, y + 53, 80, 28)
  }
  menu += line(90, 893, 1309) + text(c.crab, 90, 985, 33, true) + text(c.squid, 790, 985, 31, true)
  for (const [x, dishes] of [[90, c.crabDishes], [790, c.squidDishes]]) {
    for (const [index, [name, description]] of dishes.entries()) {
      const y = 1060 + index * 145
      menu += text(name, x, y, 32, true) + paragraph(description, x, y + 47, 37, 25, 39)
    }
  }
  menu += line(90, 1480, 1309) + text(c.together, 90, 1575, 35, true) + paragraph(c.togetherText, 90, 1630, 84, 27, 44)
  menu += text(c.details, 90, 1830, 35, true) + paragraph(c.detailsText, 90, 1885, 84, 25, 40)
  writeFileSync(new URL(`menu-${language}.svg`, output), document(1489, 2106, language, c.menu, menu))

  let drinks = text(c.drinks, 177, 88, 29, true, 'middle') + line(30, 118, 294) + text(c.hot, 30, 183, 21, true)
  for (const [index, name] of c.hotDrinks.entries()) drinks += text(name, 30, 236 + index * 43, 18)
  drinks += line(30, 520, 294) + text(c.cold, 30, 583, 21, true)
  for (const [index, name] of c.coldDrinks.entries()) drinks += text(name, 30, 636 + index * 43, 18)
  drinks += paragraph(c.drinkNote, 30, 942, 27, 18, 32) + line(30, 1088, 294) + paragraph(c.confirm, 30, 1141, 30, 15, 25)
  writeFileSync(new URL(`drinks-${language}.svg`, output), document(354, 1280, language, c.drinks, drinks))

  let event = header(c.event, c.eventTag)
  for (const [index, [title, body]] of c.eventSections.entries()) {
    const y = 410 + index * 350
    event += text(title, 90, y, 33, true) + paragraph(body, 90, y + 75, 77, 29, 48) + line(90, y + 235, 1309)
  }
  event += paragraph(c.eventCta, 90, 1880, 76, 30, 48) + text("The Sea's Crown", 90, 2010, 32, true)
  writeFileSync(new URL(`event-${language}.svg`, output), document(1489, 2106, language, c.event, event))
}
