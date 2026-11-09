import type { MenuChoice, MenuSection } from './menuTypes'

// Public source content captured for the menu reference; prices are integer VND.
// Choices recur across combos; keep one copy while preserving every source group.
const comboChoices: MenuChoice[] = [
  {
    "id": "01a0e78d-6946-724d-88ae-892b12862e68",
    "name": "Pizza Croissant Xúc Xích Ý",
    "image": "/sites/thepizzacompany-vn/menu/627-tpclto-quy-4-26new-websitepcsxucxichy640x640px-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "01a0eae4-8643-72ac-8425-d6e65b8ff7ff",
    "name": "Pizza Croissant Thịt Xông Khói & Hạt Điều",
    "image": "/sites/thepizzacompany-vn/menu/976-tpclto-quy-4-26new-websitepcsthitxongkhoivahatdieu640x640px-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "01a0eae9-7244-7294-a52c-379c75177eb9",
    "name": "Pizza Croissant Gà Bơ Tỏi & Hạt Điều",
    "image": "/sites/thepizzacompany-vn/menu/361-tpclto-quy-4-26new-websitepcspizzagabotoihatdieu640x640px-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "01a0eae6-e6ff-752f-9cb2-e237c81c1ba4",
    "name": "Pizza Croissant 5 Loại Thịt Đặc Biệt & Rau Củ",
    "image": "/sites/thepizzacompany-vn/menu/434-tpclto-quy-4-26new-websitepcs5loaithitdacbietvaraucu640x640px-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "01a0eaea-ec5b-74cb-8a9a-3e4bbd639777",
    "name": "Pizza Croissant Hải Sản Nhiệt Đới",
    "image": "/sites/thepizzacompany-vn/menu/300-tpclto-quy-4-26new-websitepcshaisannhietdoi640x640px-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "01a0eaec-60e1-76de-90ce-4a488c97163f",
    "name": "Pizza Croissant Hải Sản Pesto Xanh",
    "image": "/sites/thepizzacompany-vn/menu/85-tpclto-quy-4-26new-websitepcshaisanpestoxanh640x640px-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7703-93d3-2a2e218c56a4",
    "name": "Gà Nướng BBQ Vắt Chanh (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--2-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7be5-a4e4-fa68a6a8f3e0",
    "name": "Gà Giòn Xốt Truyền Thống (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/497-tpc640x640pxgagionxottruyenthong2mieng-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7b86-b171-ab9bd028fbaf",
    "name": "Gà Giòn Xốt Cay (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--2-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7bb4-9f1f-cefe81a497bf",
    "name": "Gà Giòn Xốt Tương Tỏi (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--2-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7355-afaf-44cc4239efbd",
    "name": "Gà Giòn Xốt Bơ Tỏi (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--2-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7363-b434-74aa3c5bcccf",
    "name": "Gà Giòn Xốt Kem (2 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--2-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7710-a868-9f2463ab72fa",
    "name": "Gà Nướng BBQ Vắt Chanh (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-7b93-8fcf-b1cfae5a60c7",
    "name": "Gà Giòn Xốt Cay (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-7bc5-a060-56d2f00b94fd",
    "name": "Gà Giòn Xốt Tương Tỏi (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-7bfe-a6e6-b746b39f02bf",
    "name": "Gà Giòn Xốt Truyền Thống (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-truyen-thong--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-737a-be7e-0b2de054a30a",
    "name": "Gà Giòn Xốt Kem (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-736e-9555-78f590801569",
    "name": "Gà Giòn Xốt Bơ Tỏi (5 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--5-mieng--w320.avif",
    "priceDelta": 84000
  },
  {
    "id": "016f5e66-e800-7726-b4b4-0fa4df23b63b",
    "name": "Gà Nướng BBQ Vắt Chanh (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "016f5e66-e800-7c08-98d8-2c1b94873a91",
    "name": "Gà Giòn Xốt Truyền Thống (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-truyen-thong--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "016f5e66-e800-7bad-b676-372bb877af25",
    "name": "Gà Giòn Xốt Cay (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "016f5e66-e800-7bd8-9717-2eafd422911f",
    "name": "Gà Giòn Xốt Tương Tỏi (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "016f5e66-e800-7387-88c8-9456019bbfa9",
    "name": "Gà Giòn Xốt Kem (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "016f5e66-e800-7378-89c9-96706fbb5a6a",
    "name": "Gà Giòn Xốt Bơ Tỏi (9 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--9-mieng--w320.avif",
    "priceDelta": 198000
  },
  {
    "id": "01a0e741-aa74-75e3-b40c-bc08a2cb8c8d",
    "name": "Mỳ Ý Gà BBQ Hạt Điều Xốt Kem",
    "image": "/sites/thepizzacompany-vn/menu/933-tpclto-quy-4-26new-websitemyygabbqhatdieu640x640px-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-75ec-bebe-235af690b04f",
    "name": "Tôm Bơ Tỏi Và Bánh Mì Nướng",
    "image": "/sites/thepizzacompany-vn/menu/tom-bo-toi-va-banh-mi-nuong-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-7597-8141-30de8d89a3da",
    "name": "Mực Chiên Giòn",
    "image": "/sites/thepizzacompany-vn/menu/muc-chien-gion-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-75d1-b4b4-e9afb94a2f96",
    "name": "Bánh Kẹp Nướng Mexico",
    "image": "/sites/thepizzacompany-vn/menu/banh-kep-nuong-mexico-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-75fe-9b9b-a9770ee5d925",
    "name": "Bánh Phô Mai Xoắn",
    "image": "/sites/thepizzacompany-vn/menu/banh-pho-mai-xoan-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7a2a-a1a1-0eee65661322",
    "name": "Salad Trộn Xốt Caesar — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tron-xot-caesar-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7a33-aeee-94f1a11d6bcc",
    "name": "Salad Trộn Xốt Caesar — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tron-xot-caesar-w320.avif",
    "priceDelta": 51000
  },
  {
    "id": "016f5e66-e800-7a7b-8949-7b77384ea0e6",
    "name": "Salad Trộn Dầu Giấm — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tron-dau-giam-w320.avif",
    "priceDelta": 51000
  },
  {
    "id": "016f5e66-e800-7a63-94d4-6729c7eec0f1",
    "name": "Salad Trộn Dầu Giấm — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tron-dau-giam-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7a53-85c5-a1e889548efa",
    "name": "Salad Đặc Sắc — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-dac-sac-w320.avif",
    "priceDelta": 51000
  },
  {
    "id": "016f5e66-e800-7a43-ac2c-393ea9c82df3",
    "name": "Salad Đặc Sắc — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-dac-sac-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-76ae-bafa-48aec1a28b78",
    "name": "Salad Gà Giòn Không Xương — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-ga-gion-khong-xuong-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-7696-b030-21dbadd47a56",
    "name": "Salad Gà Giòn Không Xương — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-ga-gion-khong-xuong-w320.avif",
    "priceDelta": 57000
  },
  {
    "id": "016f5e66-e800-75a9-89c9-a5a34019f8e0",
    "name": "Salad Da Cá Hồi Giòn — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-da-ca-hoi-gion-w320.avif",
    "priceDelta": 57000
  },
  {
    "id": "016f5e66-e800-75b6-b5b5-04611a909305",
    "name": "Salad Da Cá Hồi Giòn — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-da-ca-hoi-gion-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-7c5e-b2f2-b3b2dd21babe",
    "name": "Salad Tôm Xốt Kem Chanh — Lớn 12''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tom-xot-kem-chanh-w320.avif",
    "priceDelta": 57000
  },
  {
    "id": "016f5e66-e800-7c44-b878-d4e37198977c",
    "name": "Salad Tôm Xốt Kem Chanh — Vừa 9''",
    "image": "/sites/thepizzacompany-vn/menu/salad-tom-xot-kem-chanh-w320.avif",
    "priceDelta": 6000
  },
  {
    "id": "016f5e66-e800-75a2-a8e8-05750337c021",
    "name": "Giỏ Khoai Tây Chiên",
    "image": "/sites/thepizzacompany-vn/menu/gio-khoai-tay-chien-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7dc7-9cdc-22db5485889c",
    "name": "Da Gà Giòn Phủ Xốt Tương Tỏi",
    "image": "/sites/thepizzacompany-vn/menu/230-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Tu----o----ng-To----i-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7391-b6b6-dc58834e63b3",
    "name": "Da Gà Giòn Phủ Xốt Cay",
    "image": "/sites/thepizzacompany-vn/menu/675-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Cay-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7ddf-8787-d1bd88bb453d",
    "name": "Da Gà Giòn Phủ Xốt Truyền Thống",
    "image": "/sites/thepizzacompany-vn/menu/567-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Truye--------n-Tho--------ng-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-73e4-9515-32060f20fda8",
    "name": "Gà Giòn Không Xương",
    "image": "/sites/thepizzacompany-vn/menu/ga-gion-khong-xuong-w320.avif",
    "priceDelta": 9000
  },
  {
    "id": "016f5e66-e800-7dfe-ac2c-00ae6079df36",
    "name": "Gà Popcorn",
    "image": "/sites/thepizzacompany-vn/menu/ga-popcorn-w320.avif",
    "priceDelta": 9000
  },
  {
    "id": "016f5e66-e800-7b63-af2f-343c9de28124",
    "name": "Pepsi Lon",
    "image": "/sites/thepizzacompany-vn/menu/pepsi-lon-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7810-9ddd-959d8fddc92e",
    "name": "7Up Lon",
    "image": "/sites/thepizzacompany-vn/menu/7up-lon-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7c24-9fdf-8f42546136a7",
    "name": "Pepsi Không Đường",
    "image": "/sites/thepizzacompany-vn/menu/pepsi-khong-duong-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7cb7-adad-edf8295d266f",
    "name": "Pepsi Không Đường Vị Chanh",
    "image": "/sites/thepizzacompany-vn/menu/pepsi-khong-duong-vi-chanh-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7a4b-bb7b-12e79dc9d326",
    "name": "Mirinda Soda Kem Lon",
    "image": "/sites/thepizzacompany-vn/menu/mirinda-soda-kem-lon-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7bca-bcfc-06ae0b6eb198",
    "name": "Aquafina Chai",
    "image": "/sites/thepizzacompany-vn/menu/aquafina-chai-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7614-b979-e321430ae664",
    "name": "Trà Chanh Yuzu TEA+ (Chai)",
    "image": "/sites/thepizzacompany-vn/menu/0004746_lemon-yuzu-oolong-tea-bottle--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71f4-8f8f-3063a98aa2bd",
    "name": "Pizza Caro _ Xúc Xích Ý — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/551-tpc640x640pxpizzacaroxucxich-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71e5-8b8b-23ce7bc82882",
    "name": "Pizza Caro _ Xúc Xích Ý — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/551-tpc640x640pxpizzacaroxucxich-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71cd-a323-21ef85b05adf",
    "name": "Pizza Caro _ Giăm Bông Và Thịt Xông Khói — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzacarogiambongthitxongkhoi-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71d0-ad2d-24a64138d28d",
    "name": "Pizza Caro _ Giăm Bông Và Thịt Xông Khói — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzacarogiambongthitxongkhoi-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71ad-b4f4-4672a3d0be4a",
    "name": "Pizza Caro _ Thanh Cua Và Xúc Xích Cocktail — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/816-tpc640x640pxpizzacarothanhcuavaxucxichcocktailcopy-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-71bb-a060-24e0e022de36",
    "name": "Pizza Caro _ Thanh Cua Và Xúc Xích Cocktail — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/816-tpc640x640pxpizzacarothanhcuavaxucxichcocktailcopy-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "01a0eaec-60e1-76de-90ce-4a488c97163f",
    "name": "Pizza Croissant Hải Sản Pesto Xanh",
    "image": "/sites/thepizzacompany-vn/menu/85-tpclto-quy-4-26new-websitepcshaisanpestoxanh640x640px-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "01a0eaea-ec5b-74cb-8a9a-3e4bbd639777",
    "name": "Pizza Croissant Hải Sản Nhiệt Đới",
    "image": "/sites/thepizzacompany-vn/menu/300-tpclto-quy-4-26new-websitepcshaisannhietdoi640x640px-w320.avif",
    "priceDelta": 60000
  },
  {
    "id": "01a0eae9-7244-7294-a52c-379c75177eb9",
    "name": "Pizza Croissant Gà Bơ Tỏi & Hạt Điều",
    "image": "/sites/thepizzacompany-vn/menu/361-tpclto-quy-4-26new-websitepcspizzagabotoihatdieu640x640px-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "01a0eae6-e6ff-752f-9cb2-e237c81c1ba4",
    "name": "Pizza Croissant 5 Loại Thịt Đặc Biệt & Rau Củ",
    "image": "/sites/thepizzacompany-vn/menu/434-tpclto-quy-4-26new-websitepcs5loaithitdacbietvaraucu640x640px-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "01a0eae4-8643-72ac-8425-d6e65b8ff7ff",
    "name": "Pizza Croissant Thịt Xông Khói & Hạt Điều",
    "image": "/sites/thepizzacompany-vn/menu/976-tpclto-quy-4-26new-websitepcsthitxongkhoivahatdieu640x640px-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "01a0e78d-6946-724d-88ae-892b12862e68",
    "name": "Pizza Croissant Xúc Xích Ý",
    "image": "/sites/thepizzacompany-vn/menu/627-tpclto-quy-4-26new-websitepcsxucxichy640x640px-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-7d0b-85c5-e490f7b13ef9",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 180000
  },
  {
    "id": "016f5e66-e800-7cc9-8e8e-51a7843742b3",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 60000
  },
  {
    "id": "016f5e66-e800-7cb0-afaf-a8e5b6abaa58",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 60000
  },
  {
    "id": "016f5e66-e800-7ce5-bf7f-85daa7e2f262",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7d19-8a4a-9f589dcafc86",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 250000
  },
  {
    "id": "016f5e66-e800-7cd8-afaf-253c71d3cace",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 110000
  },
  {
    "id": "016f5e66-e800-7d25-8a4a-72e97c34d25c",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 320000
  },
  {
    "id": "016f5e66-e800-7cf4-8646-46fc012cbc55",
    "name": "Pizza Hải Sản Pesto Xanh Full Topping — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
    "priceDelta": 180000
  },
  {
    "id": "016f5e66-e800-7289-bf7f-3ca8624ddbaa",
    "name": "Pizza Hải Sản Pesto Xanh — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-72bf-9f1f-46bc66613c90",
    "name": "Pizza Hải Sản Pesto Xanh — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-72c7-b4f4-b56d3c467a43",
    "name": "Pizza Hải Sản Pesto Xanh — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 90000
  },
  {
    "id": "016f5e66-e800-72d5-b1b1-df36fe590315",
    "name": "Pizza Hải Sản Pesto Xanh — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 230000
  },
  {
    "id": "016f5e66-e800-72e0-9353-2f88c0d9cfbe",
    "name": "Pizza Hải Sản Pesto Xanh — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-72f2-a969-efd7332c097a",
    "name": "Pizza Hải Sản Pesto Xanh — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 300000
  },
  {
    "id": "016f5e66-e800-72af-9ddd-f4d5b6482d3d",
    "name": "Pizza Hải Sản Pesto Xanh — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7292-8989-3309d3742b2a",
    "name": "Pizza Hải Sản Pesto Xanh — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7e45-8141-b7663f54eb5c",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7e3d-8545-37eccba4dac5",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7df6-91d1-c166cd914946",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7e12-a7a7-885445eaecbe",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 90000
  },
  {
    "id": "016f5e66-e800-7e29-9f1f-830f6026233c",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7e7e-9c5c-d31908f49592",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 300000
  },
  {
    "id": "016f5e66-e800-7e66-8a8a-9781ecd9f41b",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 230000
  },
  {
    "id": "016f5e66-e800-7def-a5a5-85dc1518d082",
    "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7f01-a7e7-982549609535",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7efc-b5f5-f3e2c6b8ffb6",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7f47-aaea-61d31aa1cf40",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 300000
  },
  {
    "id": "016f5e66-e800-7f10-9818-b96b0a7ceae5",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 160000
  },
  {
    "id": "016f5e66-e800-7ea3-8000-dc184cd365d4",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7f3b-ac6c-52a9f203b775",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 230000
  },
  {
    "id": "016f5e66-e800-7ee2-8949-6eb1e336acab",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 90000
  },
  {
    "id": "016f5e66-e800-7e96-be7e-24b19a2f45e5",
    "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
    "priceDelta": 40000
  },
  {
    "id": "016f5e66-e800-7213-acac-4b7446d5c2f0",
    "name": "Pizza Hải Sản Cao Cấp — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-705c-a2a2-44eb6da53205",
    "name": "Pizza Hải Sản Cao Cấp — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 220000
  },
  {
    "id": "016f5e66-e800-709a-b232-67d2b4413978",
    "name": "Pizza Hải Sản Cao Cấp — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-704e-ad2d-90fc228eae8d",
    "name": "Pizza Hải Sản Cao Cấp — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 290000
  },
  {
    "id": "016f5e66-e800-706b-acac-b62af7147e95",
    "name": "Pizza Hải Sản Cao Cấp — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-7081-8d0d-a770adc91219",
    "name": "Pizza Hải Sản Cao Cấp — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 80000
  },
  {
    "id": "016f5e66-e800-7208-a222-62e8723240de",
    "name": "Pizza Hải Sản Cao Cấp — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-7077-a5e5-6094c7dd6b97",
    "name": "Pizza Hải Sản Cao Cấp — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
    "priceDelta": 130000
  },
  {
    "id": "016f5e66-e800-7223-9353-ff352d7e07be",
    "name": "Pizza Hải Sản Cocktail — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-70fe-9050-acbcf8fac4ac",
    "name": "Pizza Hải Sản Cocktail — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 80000
  },
  {
    "id": "016f5e66-e800-70c0-befe-ebe48e5840d1",
    "name": "Pizza Hải Sản Cocktail — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 220000
  },
  {
    "id": "016f5e66-e800-7100-9717-dc8b949ee0d6",
    "name": "Pizza Hải Sản Cocktail — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-70dc-8242-cb623ad5cc9d",
    "name": "Pizza Hải Sản Cocktail — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-70ef-9111-94ded110bf44",
    "name": "Pizza Hải Sản Cocktail — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 130000
  },
  {
    "id": "016f5e66-e800-70bc-9e5e-2ed590f13c76",
    "name": "Pizza Hải Sản Cocktail — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 290000
  },
  {
    "id": "016f5e66-e800-7238-9555-02b8dd022629",
    "name": "Pizza Hải Sản Cocktail — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-712c-8444-b80dc0ab1648",
    "name": "Pizza Tôm Cocktail — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 290000
  },
  {
    "id": "016f5e66-e800-713b-8080-788b1e16946d",
    "name": "Pizza Tôm Cocktail — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 220000
  },
  {
    "id": "016f5e66-e800-724a-86c6-94d0db840c3a",
    "name": "Pizza Tôm Cocktail — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-7252-9ada-9208e36a56b8",
    "name": "Pizza Tôm Cocktail — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-716b-bd7d-4901740d8ff7",
    "name": "Pizza Tôm Cocktail — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 80000
  },
  {
    "id": "016f5e66-e800-7159-9010-2ee81b647ecf",
    "name": "Pizza Tôm Cocktail — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 130000
  },
  {
    "id": "016f5e66-e800-717d-9797-679cc13ce20b",
    "name": "Pizza Tôm Cocktail — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-714f-9d9d-3249d6989dc0",
    "name": "Pizza Tôm Cocktail — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-7198-adad-6ede39528a8a",
    "name": "Pizza Hải Sản Nhiệt Đới — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 290000
  },
  {
    "id": "016f5e66-e800-71c1-b8b8-fb60931d999a",
    "name": "Pizza Hải Sản Nhiệt Đới — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 130000
  },
  {
    "id": "016f5e66-e800-71e8-ab2b-91a6131af29a",
    "name": "Pizza Hải Sản Nhiệt Đới — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-71b0-ab2b-a7663e77c8e0",
    "name": "Pizza Hải Sản Nhiệt Đới — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-7261-8a0a-ae283863e511",
    "name": "Pizza Hải Sản Nhiệt Đới — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-7272-a464-6462cf9c61fa",
    "name": "Pizza Hải Sản Nhiệt Đới — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-71dc-9252-5b052d0a1106",
    "name": "Pizza Hải Sản Nhiệt Đới — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 80000
  },
  {
    "id": "016f5e66-e800-71a4-ab2b-0d1b0bb6d2a9",
    "name": "Pizza Hải Sản Nhiệt Đới — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
    "priceDelta": 220000
  },
  {
    "id": "016f5e66-e800-72da-9414-510b16d636ce",
    "name": "Pizza Tôm Bơ Tỏi — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 130000
  },
  {
    "id": "016f5e66-e800-7310-9696-68d8d13da656",
    "name": "Pizza Tôm Bơ Tỏi — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 220000
  },
  {
    "id": "016f5e66-e800-72fe-adad-6981b0875a32",
    "name": "Pizza Tôm Bơ Tỏi — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-7296-83c3-b00be81054e4",
    "name": "Pizza Tôm Bơ Tỏi — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-72af-8e4e-b973a6090b87",
    "name": "Pizza Tôm Bơ Tỏi — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 30000
  },
  {
    "id": "016f5e66-e800-732d-a727-9d2bccc86f72",
    "name": "Pizza Tôm Bơ Tỏi — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 290000
  },
  {
    "id": "016f5e66-e800-72e8-9ede-2247dbc6d039",
    "name": "Pizza Tôm Bơ Tỏi — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 150000
  },
  {
    "id": "016f5e66-e800-72c7-af2f-c5fa2c9b3cf4",
    "name": "Pizza Tôm Bơ Tỏi — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
    "priceDelta": 80000
  },
  {
    "id": "016f5e66-e800-7919-aeee-b288a3d0f92f",
    "name": "Pizza Thịt Nguội Xúc Xích — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-793d-9b9b-860b3c3156cc",
    "name": "Pizza Thịt Nguội Xúc Xích — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-78f6-9ada-5e378e75e7a7",
    "name": "Pizza Thịt Nguội Xúc Xích — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7947-8585-35d7acf653a4",
    "name": "Pizza Thịt Nguội Xúc Xích — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7926-be7e-788f42ddcd70",
    "name": "Pizza Thịt Nguội Xúc Xích — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7dbb-8404-4b74b5d82dad",
    "name": "Pizza Thịt Nguội Xúc Xích — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-790f-9898-9706759e217c",
    "name": "Pizza Thịt Nguội Xúc Xích — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7da5-8040-0553d450cb0e",
    "name": "Pizza Thịt Nguội Xúc Xích — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7994-a424-934a86aca3a7",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7ddc-b7f7-b611ed1ffdd8",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7973-8747-32b5f69d7783",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-79ad-aeee-831f32f65e74",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-79bd-a4a4-7147e5c915b9",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7dc7-b070-92c618ac2223",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7980-b2f2-d8c9d9fd9df8",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7962-aeee-703742d3440e",
    "name": "Pizza Thịt Xông Khói Đặc Biệt — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7def-b838-4204d5f8c2b0",
    "name": "Pizza Thịt Nguội Kiểu Canada — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7a09-b232-acbfaded563a",
    "name": "Pizza Thịt Nguội Kiểu Canada — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-79e4-aaea-373301071ef1",
    "name": "Pizza Thịt Nguội Kiểu Canada — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-7a27-aa2a-7e5cd565f165",
    "name": "Pizza Thịt Nguội Kiểu Canada — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7dfa-88c8-e254ba421aaa",
    "name": "Pizza Thịt Nguội Kiểu Canada — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7a19-bafa-9b0a7b9a6480",
    "name": "Pizza Thịt Nguội Kiểu Canada — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-79fa-9010-478c386d9f34",
    "name": "Pizza Thịt Nguội Kiểu Canada — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-79dd-aded-802cea434bf0",
    "name": "Pizza Thịt Nguội Kiểu Canada — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7b03-adad-eca5a4475bd2",
    "name": "Pizza Gà Nướng 3 Vị — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7ad7-8b4b-e6b2b2bbdbfd",
    "name": "Pizza Gà Nướng 3 Vị — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7ab0-94d4-811992a5499e",
    "name": "Pizza Gà Nướng 3 Vị — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7e07-b5b5-3c01025001ce",
    "name": "Pizza Gà Nướng 3 Vị — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7af5-9595-d46273518e6a",
    "name": "Pizza Gà Nướng 3 Vị — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-7aeb-bb7b-20ad7f929552",
    "name": "Pizza Gà Nướng 3 Vị — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7ac5-b4b4-94ea5f0139f7",
    "name": "Pizza Gà Nướng 3 Vị — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-7e10-8505-def8e2b410c1",
    "name": "Pizza Gà Nướng 3 Vị — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7cf0-b4b4-64e5c8799659",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7d0d-9ada-e4ab46a4cf1c",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-7e4d-8808-9727f76634e0",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7cc0-a020-1e2ce6515b38",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7d13-aa6a-7b411e968797",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7e52-95d5-a4f30544d0b8",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7cd8-9616-42519f91e215",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-7cef-b9f9-b4b49590219b",
    "name": "Pizza 5 Loại Thịt Đặc Biệt — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7c86-a525-bb5994f77738",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7e63-b9f9-0b854ff4b17c",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7c76-8181-487b735a6729",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7c57-bdbd-23c5ce2bdcd4",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 280000
  },
  {
    "id": "016f5e66-e800-7ca8-b9f9-722812468a85",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 20000
  },
  {
    "id": "016f5e66-e800-7e70-a2e2-61dc6cc35af2",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 140000
  },
  {
    "id": "016f5e66-e800-7c66-9b5b-a573e84b4e8c",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 210000
  },
  {
    "id": "016f5e66-e800-7c91-9555-1e255a081830",
    "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
    "priceDelta": 70000
  },
  {
    "id": "016f5e66-e800-7a99-a6a6-059b538773a7",
    "name": "Pizza Gà Nướng Dứa — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-77b3-9292-7f47ac688d6e",
    "name": "Pizza Gà Nướng Dứa — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7a83-b070-a80c1fe6b674",
    "name": "Pizza Gà Nướng Dứa — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7a77-ab2b-83c2d930eb17",
    "name": "Pizza Gà Nướng Dứa — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-7a50-ac6c-c4c6e9cb5281",
    "name": "Pizza Gà Nướng Dứa — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-77af-9ada-b68e8e05bd57",
    "name": "Pizza Gà Nướng Dứa — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7a66-9393-d77c06ac215f",
    "name": "Pizza Gà Nướng Dứa — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7a44-a9a9-197a09a32a24",
    "name": "Pizza Gà Nướng Dứa — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-790f-a222-ca3fd9fc2318",
    "name": "Pizza Xúc Xích Ý — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7918-befe-974345cdb05b",
    "name": "Pizza Xúc Xích Ý — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-7921-9616-16abe0260e07",
    "name": "Pizza Xúc Xích Ý — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-7937-9d5d-433cd27170f0",
    "name": "Pizza Xúc Xích Ý — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-78cd-aeae-01359288835a",
    "name": "Pizza Xúc Xích Ý — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-78d0-bfbf-2ca441521504",
    "name": "Pizza Xúc Xích Ý — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-78e2-9858-fa71436d00c2",
    "name": "Pizza Xúc Xích Ý — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-78fe-97d7-ebb9a8f01a13",
    "name": "Pizza Xúc Xích Ý — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-77d0-b6f6-14125e19b4e1",
    "name": "Pizza Thịt Nguội & Nấm — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-77c2-b131-cbb2a9e949c2",
    "name": "Pizza Thịt Nguội & Nấm — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7b35-8484-e9de6b135417",
    "name": "Pizza Thịt Nguội & Nấm — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-7b6d-8444-dd9166bc1010",
    "name": "Pizza Thịt Nguội & Nấm — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7b4f-8686-e591990a81db",
    "name": "Pizza Thịt Nguội & Nấm — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-7b72-86c6-b7a37dbda6b6",
    "name": "Pizza Thịt Nguội & Nấm — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7b5b-abab-7929161e5c3d",
    "name": "Pizza Thịt Nguội & Nấm — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-7b21-bf7f-7d1f5dbde946",
    "name": "Pizza Thịt Nguội & Nấm — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7be4-b1f1-d97fce81da3f",
    "name": "Pizza Hawaiian — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-77e6-b6f6-d1b4090c5975",
    "name": "Pizza Hawaiian — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7bc3-8b4b-ccd0770a42ee",
    "name": "Pizza Hawaiian — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-77f7-b4f4-cce6ac3c4ee1",
    "name": "Pizza Hawaiian — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7ba8-84c4-702854310b0a",
    "name": "Pizza Hawaiian — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-7bdc-b2f2-e5a87f949b65",
    "name": "Pizza Hawaiian — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7b92-b8f8-b66033b40d4b",
    "name": "Pizza Hawaiian — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-7bbf-9696-b9c6696d9625",
    "name": "Pizza Hawaiian — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7836-9494-59d5a9f5608b",
    "name": "Pizza Phô Mai — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7898-b131-b88a1d2dc015",
    "name": "Pizza Phô Mai — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-7850-91d1-368bf844e47e",
    "name": "Pizza Phô Mai — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-78a9-8444-c99b489bd98d",
    "name": "Pizza Phô Mai — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-7883-8505-c46c09a1d03f",
    "name": "Pizza Phô Mai — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-7840-9090-4dc0a40092d8",
    "name": "Pizza Phô Mai — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7875-8040-2010383cc851",
    "name": "Pizza Phô Mai — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7864-9919-68f8c54a9571",
    "name": "Pizza Phô Mai — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7445-9454-a97fb93a0a33",
    "name": "Pizza Rau Củ — Vừa 9'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 100000
  },
  {
    "id": "016f5e66-e800-7451-a4e4-42031c18b88e",
    "name": "Pizza Rau Củ — Lớn 12'' · Viền phô mai xúc xích",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 260000
  },
  {
    "id": "016f5e66-e800-7801-aeae-60a910c6d383",
    "name": "Pizza Rau Củ — Vừa 9'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7c09-8787-fcceadfce24a",
    "name": "Pizza Rau Củ — Lớn 12'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 190000
  },
  {
    "id": "016f5e66-e800-781f-9353-9680cee809bf",
    "name": "Pizza Rau Củ — Lớn 12'' · Cực mỏng",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7c3a-8080-1ac32534e8ab",
    "name": "Pizza Rau Củ — Vừa 9'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7c29-90d0-2df62b33ca92",
    "name": "Pizza Rau Củ — Vừa 9'' · Viền phô mai",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 50000
  },
  {
    "id": "016f5e66-e800-7c1e-afaf-43f01a6979e2",
    "name": "Pizza Rau Củ — Lớn 12'' · Dày",
    "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
    "priceDelta": 120000
  },
  {
    "id": "016f5e66-e800-7df0-8ece-248ef3e19802",
    "name": "Khay Gà Tổng Hợp - Xốt Truyền Thống",
    "image": "/sites/thepizzacompany-vn/menu/0004144_trio-chicken-platter_-k-sauce-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7de8-b1f1-649e73f545ab",
    "name": "Khay Gà Tổng Hợp - Xốt Tương Tỏi",
    "image": "/sites/thepizzacompany-vn/menu/597-tpc640x640pxkhaygatonghopxottuongtoi-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-73af-8b0b-667e412fd9a8",
    "name": "Khay Gà Tổng Hợp - Xốt Cay",
    "image": "/sites/thepizzacompany-vn/menu/66-tpc640x640pxkhaygatonghopxotcay-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7597-8141-30de8d89a3da",
    "name": "Mực Chiên Giòn",
    "image": "/sites/thepizzacompany-vn/menu/muc-chien-gion-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7ae1-8e4e-f03125dbd14f",
    "name": "Mỳ Ý Cay Với Xúc Xích",
    "image": "/sites/thepizzacompany-vn/menu/my-y-cay-voi-xuc-xich-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-77c0-9656-c72094e1b056",
    "name": "Mỳ Ý Chay Xốt Kem Tươi",
    "image": "/sites/thepizzacompany-vn/menu/my-y-chay-xot-kem-tuoi-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7ac6-8aca-65fbfaaa35fd",
    "name": "Mỳ Ý Chay Xốt Marinara",
    "image": "/sites/thepizzacompany-vn/menu/my-y-chay-xot-marinara-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7ab4-b4f4-52097dbb3b0d",
    "name": "Mỳ Ý Cay Hải Sản",
    "image": "/sites/thepizzacompany-vn/menu/my-y-cay-hai-san-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7ada-9616-cae590dfa10c",
    "name": "Mỳ Ý Tôm Xốt Kem Cà Chua",
    "image": "/sites/thepizzacompany-vn/menu/my-y-tom-xot-kem-ca-chua-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7af0-acac-690a6a86d7b4",
    "name": "Mỳ Ý Giăm Bông Và Nấm Với Xốt Kem",
    "image": "/sites/thepizzacompany-vn/menu/my-y-giam-bong-va-nam-voi-xot-kem-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7b16-94d4-aea30e645232",
    "name": "Mỳ Ý Xốt Bò Bằm",
    "image": "/sites/thepizzacompany-vn/menu/my-y-xot-bo-bam-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7c6a-a1a1-cb05b14d5db2",
    "name": "Mỳ Ý Hải Sản Xốt Kem Chanh",
    "image": "/sites/thepizzacompany-vn/menu/my-y-hai-san-xot-kem-chanh-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7489-9ddd-65992ca213fb",
    "name": "Mỳ Ý Pesto",
    "image": "/sites/thepizzacompany-vn/menu/my-y-pesto-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7871-b0f0-16f85a726429",
    "name": "Mỳ Ý Nghêu Xốt Húng Quế",
    "image": "/sites/thepizzacompany-vn/menu/my-y-ngheu-xot-hung-que-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7888-8343-2cfa5c894cb0",
    "name": "Mỳ Ý Nghêu Xốt Cay",
    "image": "/sites/thepizzacompany-vn/menu/my-y-ngheu-xot-cay-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7581-a8a8-6888f667a535",
    "name": "Khoai Tây Chiên",
    "image": "/sites/thepizzacompany-vn/menu/khoai-tay-chien-w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-7543-9353-df386e07b56b",
    "name": "Cánh Gà Nướng BBQ (10 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/canh-ga-nuong-bbq--10-mieng--w320.avif",
    "priceDelta": 0
  },
  {
    "id": "016f5e66-e800-75c7-8ccc-4e508c507229",
    "name": "Cánh Gà Tẩm Bột Chiên Giòn (10 miếng)",
    "image": "/sites/thepizzacompany-vn/menu/canh-ga-tam-bot-chien-gion--10-mieng--w320.avif",
    "priceDelta": 0
  }
]

export const menuSections: MenuSection[] = [
  {
    "id": "combo",
    "name": "Combo, khuyến mãi",
    "icon": "/sites/thepizzacompany-vn/menu/730-TPC_ICON_100x100px_KHUYEN-MAI-w64.avif",
    "groups": [
      {
        "id": "french-croissant-pizza-by-the-pizza-company",
        "name": "FRENCH CROISSANT PIZZA by The Sea's Crown",
        "description": "Lần đầu tiên Pizza kết hợp cùng bánh Croissant trứ danh Pháp. Khi đế pizza được lấy cảm hứng sáng tạo từ bánh Croissant ngàn lớp, thơm bơ Pháp. Pizza Croissant phong cách Pháp hoàn toàn mới, mang đến trải nghiệm thưởng thức pizza vô cùng độc đáo: Giòn Xốp - Nhẹ Tênh - Thơm Bơ. Bon appétit!\nKhám phá 6 phiên bản French Croissant Pizza với 2 hương vị topping mới: Pizza Croissant Gà Bơ Tỏi & Hạt Điều và Pizza Croissant Thịt Xông Khói & Hạt Điều cùng 4 loại topping Best Seller của The Pizza Company. Điểm nhấn đắt giá chính là hạt điều đặc sản Bình Phước mang đậm dấu ấn Việt. Chọn 1 phiên bản hay chọn tất cả để không bỏ lỡ phong cách pizza độc bản, giới hạn trong mùa này của chúng tôi bạn nhé.",
        "banner": "/sites/thepizzacompany-vn/menu/420-tpclto-quy-4-26new-websitecoverpromotion2400x400px-w1024.avif",
        "items": [
          {
            "id": "01a0ebd4-8ee6-77ad-b07b-d09d7e893bdd",
            "name": "Combo Pizza Croissant bất kỳ & 01 Gà Giòn Phủ Xốt",
            "description": "•\t01 Pizza Croissant \n•\t01 Phần Gà Giòn Phủ Xốt (2/5/9 miếng) *Lựa chọn xốt: Truyền Thống / Cay / Tương Tỏi / Bơ Tỏi / Kem hoặc Gà Nướng BBQ Vắt Chanh",
            "image": "/sites/thepizzacompany-vn/menu/374-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy4-w640.avif",
            "price": 336000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0ebd4-8fc3-752c-bbe5-25d2f2316b0e",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[2], comboChoices[3], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0ebd4-8fc3-752c-bbe5-2a7c98c1d1bf",
                "name": "Gà Giòn",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[6], comboChoices[7], comboChoices[8], comboChoices[9], comboChoices[10], comboChoices[11],
                  comboChoices[12], comboChoices[13], comboChoices[14], comboChoices[15], comboChoices[16], comboChoices[17],
                  comboChoices[18], comboChoices[19], comboChoices[20], comboChoices[21], comboChoices[22], comboChoices[23]
                ]
              }
            ]
          },
          {
            "id": "01a0eb48-4514-743d-8b8a-ccd58fda00a9",
            "name": "Combo Pizza Croissant bất kỳ & 01 Mỳ Ý & 01 Khai Vị",
            "description": "•\t01 Pizza Croissant \n•\t01 Mỳ Ý Gà BBQ Hạt Điều Xốt Kem \n•\t01 Khai Vị: Tôm Bơ Tỏi Cay & Bánh Mì Nướng / Bánh Kẹp Nướng Mexico / Mực Chiên Giòn / Bánh Mì Bơ Tỏi Phủ Phô Mai / Bánh Phô Mai Xoắn",
            "image": "/sites/thepizzacompany-vn/menu/64-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy2-w640.avif",
            "price": 417000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0eb48-4606-73ba-84fb-757f6c62c25b",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[2], comboChoices[3], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0eb48-4606-73ba-84fb-798499cd5f39",
                "name": "Mỳ Ý Ưu Đãi",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[24]
                ]
              },
              {
                "id": "01a0eb48-4606-73ba-84fb-7c64bcff00bf",
                "name": "Khai Vị Ưu Đãi",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[25], comboChoices[26], comboChoices[27], comboChoices[28]
                ]
              }
            ]
          },
          {
            "id": "01a0eb28-fab8-7607-8386-722c869fd4d3",
            "name": "Combo Pizza Croissant bất kỳ & 01 Mỳ Ý & 01 Salad từ cỡ Vừa",
            "description": "•\t01 Pizza Croissant\n•\t01 Mỳ Ý Gà BBQ Hạt Điều Xốt Kem\n•\t01 Salad Bất Kỳ,  Từ Cỡ Vừa",
            "image": "/sites/thepizzacompany-vn/menu/57-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy-w640.avif",
            "price": 399000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0eb28-fce7-766a-b3bf-207095497c8f",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[3], comboChoices[2], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0eb28-fce7-766a-b3bf-2798c601beb5",
                "name": "Mỳ Ý Ưu Đãi",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[24]
                ]
              },
              {
                "id": "01a0eb28-fce7-766a-b3bf-2b6f4d2d7b50",
                "name": "Salad Ưu Đãi",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[29], comboChoices[30], comboChoices[31], comboChoices[32], comboChoices[33], comboChoices[34],
                  comboChoices[35], comboChoices[36], comboChoices[37], comboChoices[38], comboChoices[39], comboChoices[40]
                ]
              }
            ]
          },
          {
            "id": "01a0eb66-d1e6-7726-8de9-0cbba8b6ef6e",
            "name": "Combo Pizza Croissant bất kỳ & 02 Khai vị",
            "description": "•\t01 Pizza Croissant \n•\t01 Khai Vị: Giỏ Khoai Tây Chiên / Gà Popcorn / Gà Giòn Không Xương / Da Gà Phủ Xốt\n•\t01 Khai Vị: Tôm Bơ Tỏi Cay & Bánh Mì Nướng / Bánh Kẹp Nướng Mexico / Mực Chiên Giòn / Bánh Phô Mai Xoắn",
            "image": "/sites/thepizzacompany-vn/menu/803-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy3-w640.avif",
            "price": 384000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0eb66-d2b6-725b-886f-fc40888ac7d0",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[2], comboChoices[3], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0eb66-d2b6-725b-8870-027f631dac33",
                "name": "Khai Vị Ưu Đãi - Số 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[41], comboChoices[42], comboChoices[43], comboChoices[44], comboChoices[45], comboChoices[46]
                ]
              },
              {
                "id": "01a0eb66-d2b6-725b-8870-0672dab37ae6",
                "name": "Khai Vị Ưu Đãi - Số 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[25], comboChoices[27], comboChoices[26], comboChoices[28]
                ]
              }
            ]
          },
          {
            "id": "01a0ebe0-dad3-7798-ac6c-13487f9a0b08",
            "name": "Combo Pizza Croissant bất kỳ & 03 Nước Uống",
            "description": "•\t01 Pizza Croissant \n•\t03 Nước uống Chọn ly/lon: 7UP / Pepsi / Pepsi Black / Pepsi Black Lime (Lon)/ Mirinda Soda Cream (Lon) / Lipton (Ly)/ Aquafina (Chai)/ Trà Chanh Yuzu Tea+ (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/58-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy5-w640.avif",
            "price": 309000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0ebe0-dc17-75c6-a07d-01ca8e5ac36a",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[2], comboChoices[3], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0ebe0-dc17-75c6-a07d-07f9c7318a9a",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 3,
                "maxSelections": 3,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[48], comboChoices[49], comboChoices[50], comboChoices[51], comboChoices[52],
                  comboChoices[53]
                ]
              }
            ]
          },
          {
            "id": "01a0ebea-faee-7168-b4d4-d574e63ae9f1",
            "name": "Combo Pizza Croissant bất kỳ & 05 Nước Uống",
            "description": "•\t01 Pizza Croissant \n•\t05 Nước uống Chọn Ly/Lon: 7UP / Pepsi / Pepsi Black/ Pepsi Black Lime (Lon) / Mirinda Soda Cream (Lon)/ Lipton (Ly)/ Aquafina (Chai)/ Trà Chanh Yuzu Tea+ (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/985-tpcltoquy4-26newwebsitecombo-thumbnail1180x664pxcopy6-w640.avif",
            "price": 345000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "01a0ebea-fbef-75ca-8eb2-4d8a0f5a6cad",
                "name": "Pizza Mua",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[0], comboChoices[1], comboChoices[2], comboChoices[3], comboChoices[4], comboChoices[5]
                ]
              },
              {
                "id": "01a0ebea-fbef-75ca-8eb2-51d9701d539b",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 5,
                "maxSelections": 5,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[48], comboChoices[49], comboChoices[50], comboChoices[51], comboChoices[52],
                  comboChoices[53]
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "combo-pizza-caro",
        "name": "Combo Pizza Caro",
        "description": "- Áp dụng cho dịch vụ Mua mang về tại trực tiếp tại nhà hàng, Mua mang về và Giao hàng tận nơi khi đặt hàng qua Website thepizzacompany.vn & Hotline 19006066\n- Không áp dụng ngày Lễ, Tết (01/09 - 02/09, 24/12 - 25/12)\n- Không áp dụng chung với các chương trình khuyến mãi, giảm giá khác. Combo Pizza Caro:\n- 03 Pizza Caro Đế Cực Mỏng Giòn/ Dày, Cỡ Vừa\n- 02 Nước uống",
        "banner": "/sites/thepizzacompany-vn/menu/613-tpcpizzacarocoverpromotion2400x400px-w1024.avif",
        "items": [
          {
            "id": "016f5e66-e800-7a92-9151-170c5287da10",
            "name": "Combo Pizza Caro",
            "description": "Combo Pizza Caro:\n- 03 Pizza Caro Đế Cực Mỏng Giòn/ Dày, Cỡ Vừa\n- 02 Nước uống",
            "image": "/sites/thepizzacompany-vn/menu/944-tpcpizzacarocombo-thumbnail1200675px-w640.avif",
            "price": 289000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "016f5e66-e800-7c13-8747-9687921d6ed5",
                "name": "Pizza Caro 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[54], comboChoices[55], comboChoices[56], comboChoices[57], comboChoices[58], comboChoices[59]
                ]
              },
              {
                "id": "016f5e66-e800-7cbd-8e8e-d983a72edea4",
                "name": "Pizza Caro 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[54], comboChoices[55], comboChoices[56], comboChoices[57], comboChoices[58], comboChoices[59]
                ]
              },
              {
                "id": "016f5e66-e800-7d5b-b030-6622befe72fb",
                "name": "Pizza Caro 3",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[54], comboChoices[55], comboChoices[56], comboChoices[57], comboChoices[58], comboChoices[59]
                ]
              },
              {
                "id": "019ef932-f4d1-71fa-90e4-e62e9749ba25",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 2,
                "maxSelections": 2,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[50], comboChoices[49], comboChoices[51], comboChoices[53], comboChoices[52],
                  comboChoices[48]
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "sinh-nhat-ron-rang-be-cuoi-gion-tan",
        "name": "SINH NHẬT RỘN RÀNG - BÉ CƯỜI GIÒN TAN",
        "description": "🎉 Mỗi năm một lần, cứ tới sinh nhật các Bé là Ba Mẹ lại phải lo đủ thứ, đau đầu từ việc lựa chọn món ngon cho tới trang trí tiệc, thì năm nay đã có The Pizza Company lo từ A tới Á với 4 combo sinh nhật bao no, bao hời, đảm bảo các bé mê tít luônnnnnnn:\n🍕 Combo TIỆC CƯỜI GIÒN TAN\n🍕 Combo TIỆC MỪNG HÂN HOAN\n🍕 Combo TIỆC VUI RỘN RÀNG\n🍕 Combo TIỆC TÙNG HOÀNH TRÁNG\n🥰 Không chỉ có vậy, kì này Ba Mẹ còn nhẹ nhàng hơn với các gói trang trí từ Cơ bản cho tới Cao cấp của nhà The Pizza Company, cho tiệc của Bé thêm hoành tráng, tạo nên một ngày sinh nhật trọn vẹn & khó quên.",
        "banner": "/sites/thepizzacompany-vn/menu/859-tpckidpizzacoverpromotion2400x400px-w1024.avif",
        "items": [
          {
            "id": "016f5e66-e800-7522-ba3a-3e4b89a4311c",
            "name": "Tiệc Tùng Hoành Tráng",
            "description": "- 2 Pizza Truyền Thống (Đế Dày/ Mỏng, cỡ Vừa)\n- 05 Gà Nướng BBQ (2 miếng)/ Gà Giòn Phủ Xốt (2 miếng) (Lựa chọn Xốt: Truyền Thống/ Cay/ Tương Tỏi/ Kem/ Bơ Tỏi)\n- 04 Mỳ Ý bất kỳ\n- 02 Bánh Phô Mai Xoắn/ Mực Chiên Giòn/ Khay Gà Tổng Hợp (Lựa chọn Xốt: Truyền Thống/ Cay/ Tương Tỏi)\n- 10 Pepsi/ Pepsi Black/ Pepsi Black Lime/ 7UP/ Mirinda Soda Kem (Lon); Aquafina (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/611-tpcbirthdaytiectunghoanhtrang-thumbnail1200675pxcopy3-w640.avif",
            "price": 1799000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "016f5e66-e800-7e2b-b4f4-40e583803254",
                "name": "Pizza Truyền Thống 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "016f5e66-e800-74b9-8303-5023dcd05362",
                "name": "Pizza Truyền Thống 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "019d61cf-c4c8-76e9-88e6-800578dc0ccf",
                "name": "Khai Vị",
                "required": true,
                "minSelections": 2,
                "maxSelections": 2,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[28], comboChoices[234], comboChoices[235], comboChoices[236], comboChoices[237]
                ]
              },
              {
                "id": "019d61cf-c4c9-701f-8474-d70017445281",
                "name": "Gà Giòn",
                "required": true,
                "minSelections": 5,
                "maxSelections": 5,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[7], comboChoices[10], comboChoices[8], comboChoices[9], comboChoices[11], comboChoices[6]
                ]
              },
              {
                "id": "019d61cf-c4c9-701f-8474-daeb03ff61bf",
                "name": "Mỳ Ý",
                "required": true,
                "minSelections": 4,
                "maxSelections": 4,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[238], comboChoices[239], comboChoices[240], comboChoices[241], comboChoices[242], comboChoices[243],
                  comboChoices[244], comboChoices[245], comboChoices[246], comboChoices[247], comboChoices[248]
                ]
              },
              {
                "id": "019d61cf-c4ca-70e2-ac54-aea0585df2aa",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 10,
                "maxSelections": 10,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[50], comboChoices[49], comboChoices[51], comboChoices[53], comboChoices[52],
                  comboChoices[48]
                ]
              }
            ]
          },
          {
            "id": "016f5e66-e800-76d2-8b0b-bfd91826a6c9",
            "name": "Tiệc Vui Rộn Ràng",
            "description": "- 02 Pizza Truyền Thống (Đế Dày/ Mỏng, cỡ Vừa)\n- 02 Cánh Gà Tẩm Bột Chiên Giòn (10 miếng)/ Cánh Gà Nướng BBQ (10 miếng)\n- 04 Mỳ Ý bất kỳ\n- 04 Khoai Tây Chiên/ Giỏ Khoai Tây/ Da Gà Giòn Phủ Xốt (Lựa chọn Xốt: Truyền Thống/ Cay/ Tương Tỏi)\n- 10 Pepsi/ Pepsi Black/ Pepsi Black Lime/ 7UP/ Mirinda Soda Kem (Lon); Aquafina (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/801-tpcbirthdaytieccuoironrang-thumbnail1200675pxcopy2-w640.avif",
            "price": 1699000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "016f5e66-e800-7314-a565-a1694f46ab6a",
                "name": "Pizza Truyền Thống 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "016f5e66-e800-79ac-93d3-89a778b5ed56",
                "name": "Pizza Truyền Thống 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "019d61ae-6e3c-745f-b59f-5df67dcd9a9b",
                "name": "Khai Vị",
                "required": true,
                "minSelections": 4,
                "maxSelections": 4,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[41], comboChoices[249], comboChoices[42], comboChoices[44], comboChoices[43]
                ]
              },
              {
                "id": "019d61ae-6e3d-71a9-8d27-e5624fe09532",
                "name": "Cánh Gà",
                "required": true,
                "minSelections": 2,
                "maxSelections": 2,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[250], comboChoices[251]
                ]
              },
              {
                "id": "019d61ae-6e3e-7709-8d69-5941e6ff9890",
                "name": "Mỳ Ý",
                "required": true,
                "minSelections": 4,
                "maxSelections": 4,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[238], comboChoices[239], comboChoices[240], comboChoices[241], comboChoices[242], comboChoices[243],
                  comboChoices[244], comboChoices[245], comboChoices[246], comboChoices[247], comboChoices[248]
                ]
              },
              {
                "id": "019d61ae-6e3f-73bc-b227-36d19280f84b",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 10,
                "maxSelections": 10,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[50], comboChoices[49], comboChoices[51], comboChoices[53], comboChoices[52],
                  comboChoices[48]
                ]
              }
            ]
          },
          {
            "id": "016f5e66-e800-784e-8f8f-16a41639d998",
            "name": "Tiệc Mừng Hân Hoan",
            "description": "- 02 Pizza Truyền Thống (Đế Dày/ Mỏng, cỡ Vừa)\n- 05 Gà Nướng BBQ (2 miếng)/ Gà Giòn Phủ Xốt (2 miếng) (Lựa chọn Xốt: Truyền Thống/ Cay/ Tương Tỏi/ Kem/ Bơ Tỏi)\n- 02 Bánh Phô Mai Xoắn\n- 10 Pepsi/ Pepsi Black/ Pepsi Black Lime/ 7UP/ Mirinda Soda Kem (Lon); Aquafina (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/792-tpcbirthdaytiecmunghanhoan-thumbnail1200675pxcopy2-w640.avif",
            "price": 1399000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "016f5e66-e800-73fa-a2a2-25be3bd64594",
                "name": "Pizza Truyền Thống 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "016f5e66-e800-7d69-9999-b9ac2d31a9f8",
                "name": "Pizza Truyền Thống 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "019d6193-274b-7324-847a-c3319ef815c0",
                "name": "Gà Giòn",
                "required": true,
                "minSelections": 5,
                "maxSelections": 5,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[7], comboChoices[10], comboChoices[8], comboChoices[9], comboChoices[11], comboChoices[6]
                ]
              },
              {
                "id": "019d6193-2749-72d9-afb4-97069d3e0e8b",
                "name": "Khai Vị",
                "required": true,
                "minSelections": 2,
                "maxSelections": 2,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[28]
                ]
              },
              {
                "id": "019d6193-274b-7324-847a-c4b6f1c21a15",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 10,
                "maxSelections": 10,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[50], comboChoices[49], comboChoices[51], comboChoices[53], comboChoices[52],
                  comboChoices[48]
                ]
              }
            ]
          },
          {
            "id": "016f5e66-e800-792d-af2f-f4338dd2b126",
            "name": "Tiệc Cười Giòn Tan",
            "description": "- 02 Pizza Truyền Thống (Đế Dày/ Mỏng, cỡ Vừa)\n- 01 Cánh Gà Tẩm Bột Chiên Giòn (10 miếng)/ Cánh Gà Nướng BBQ (10 miếng) \n- 04 Khoai Tây Chiên \n- 10 Pepsi/ Pepsi Black/ Pepsi Black Lime/ 7UP/ Mirinda Soda Kem (Lon); Aquafina (Chai)",
            "image": "/sites/thepizzacompany-vn/menu/357-tpcbirthdaytieccuoigiontan-thumbnail1200675pxcopy-w640.avif",
            "price": 1099000,
            "kind": "combo",
            "tags": [],
            "variants": [],
            "options": [
              {
                "id": "016f5e66-e800-76c3-8909-14d7e851c166",
                "name": "Pizza Truyền Thống 1",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "016f5e66-e800-703d-ad2d-08e9abc548ac",
                "name": "Pizza Truyền Thống 2",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[60], comboChoices[61], comboChoices[62], comboChoices[63], comboChoices[64], comboChoices[65],
                  comboChoices[66], comboChoices[67], comboChoices[68], comboChoices[69], comboChoices[70], comboChoices[71],
                  comboChoices[72], comboChoices[73], comboChoices[74], comboChoices[75], comboChoices[76], comboChoices[77],
                  comboChoices[78], comboChoices[79], comboChoices[80], comboChoices[81], comboChoices[82], comboChoices[83],
                  comboChoices[84], comboChoices[85], comboChoices[86], comboChoices[87], comboChoices[88], comboChoices[89],
                  comboChoices[90], comboChoices[91], comboChoices[92], comboChoices[93], comboChoices[94], comboChoices[95],
                  comboChoices[96], comboChoices[97], comboChoices[98], comboChoices[99], comboChoices[100], comboChoices[101],
                  comboChoices[102], comboChoices[103], comboChoices[104], comboChoices[105], comboChoices[106], comboChoices[107],
                  comboChoices[108], comboChoices[109], comboChoices[110], comboChoices[111], comboChoices[112], comboChoices[113],
                  comboChoices[114], comboChoices[115], comboChoices[116], comboChoices[117], comboChoices[118], comboChoices[119],
                  comboChoices[120], comboChoices[121], comboChoices[122], comboChoices[123], comboChoices[124], comboChoices[125],
                  comboChoices[126], comboChoices[127], comboChoices[128], comboChoices[129], comboChoices[130], comboChoices[131],
                  comboChoices[132], comboChoices[133], comboChoices[134], comboChoices[135], comboChoices[136], comboChoices[137],
                  comboChoices[138], comboChoices[139], comboChoices[140], comboChoices[141], comboChoices[142], comboChoices[143],
                  comboChoices[144], comboChoices[145], comboChoices[146], comboChoices[147], comboChoices[148], comboChoices[149],
                  comboChoices[150], comboChoices[151], comboChoices[152], comboChoices[153], comboChoices[154], comboChoices[155],
                  comboChoices[156], comboChoices[157], comboChoices[158], comboChoices[159], comboChoices[160], comboChoices[161],
                  comboChoices[162], comboChoices[163], comboChoices[164], comboChoices[165], comboChoices[166], comboChoices[167],
                  comboChoices[168], comboChoices[169], comboChoices[170], comboChoices[171], comboChoices[172], comboChoices[173],
                  comboChoices[174], comboChoices[175], comboChoices[176], comboChoices[177], comboChoices[178], comboChoices[179],
                  comboChoices[180], comboChoices[181], comboChoices[182], comboChoices[183], comboChoices[184], comboChoices[185],
                  comboChoices[186], comboChoices[187], comboChoices[188], comboChoices[189], comboChoices[190], comboChoices[191],
                  comboChoices[192], comboChoices[193], comboChoices[194], comboChoices[195], comboChoices[196], comboChoices[197],
                  comboChoices[198], comboChoices[199], comboChoices[200], comboChoices[201], comboChoices[202], comboChoices[203],
                  comboChoices[204], comboChoices[205], comboChoices[206], comboChoices[207], comboChoices[208], comboChoices[209],
                  comboChoices[210], comboChoices[211], comboChoices[212], comboChoices[213], comboChoices[214], comboChoices[215],
                  comboChoices[216], comboChoices[217], comboChoices[218], comboChoices[219], comboChoices[220], comboChoices[221],
                  comboChoices[222], comboChoices[223], comboChoices[224], comboChoices[225], comboChoices[226], comboChoices[227],
                  comboChoices[228], comboChoices[229], comboChoices[230], comboChoices[231], comboChoices[232], comboChoices[233]
                ]
              },
              {
                "id": "016f5e66-e800-7d58-b131-63c21f99b2c8",
                "name": "Cánh Gà",
                "required": true,
                "minSelections": 1,
                "maxSelections": 1,
                "allowDuplicates": false,
                "choices": [
                  comboChoices[250], comboChoices[251]
                ]
              },
              {
                "id": "019d611e-67a3-714d-b72c-cc32d502db3c",
                "name": "Khai Vị",
                "required": true,
                "minSelections": 4,
                "maxSelections": 4,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[249]
                ]
              },
              {
                "id": "019d5cd8-d0f7-7146-a7eb-5e4ee743475b",
                "name": "Thức Uống",
                "required": true,
                "minSelections": 10,
                "maxSelections": 10,
                "allowDuplicates": true,
                "choices": [
                  comboChoices[47], comboChoices[50], comboChoices[49], comboChoices[51], comboChoices[53], comboChoices[52],
                  comboChoices[48]
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "pizza",
    "name": "PIZZA",
    "icon": "/sites/thepizzacompany-vn/menu/15-TPC_ICON_100x100px_PIZZA-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/305-tpcbannercatepizza2400x400px-w1024.avif",
    "groups": [
      {
        "id": "pizza-croissant",
        "name": "PIZZA CROISSANT",
        "items": [
          {
            "id": "01a0e78d-6936-7668-9957-e500c4717d4c",
            "name": "Pizza Croissant Xúc Xích Ý",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, kết hợp cùng gấp đôi xúc xích Ý, cho phần topping đầy đặn cùng hương vị đậm đà, hấp dẫn.",
            "image": "/sites/thepizzacompany-vn/menu/627-tpclto-quy-4-26new-websitepcsxucxichy640x640px-w320.avif",
            "price": 255000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0e78d-6946-724d-88ae-892b12862e68",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 255000
              }
            ],
            "options": []
          },
          {
            "id": "01a0eae4-8633-770f-baae-b7ec2121a60f",
            "name": "Pizza Croissant Thịt Xông Khói & Hạt Điều",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, được phủ ngập xốt phô mai, kết hợp hài hòa cùng cùng thịt xông khói và lá húng quế tây tươi thơm nức và hạt điều rang Việt Nam.",
            "image": "/sites/thepizzacompany-vn/menu/976-tpclto-quy-4-26new-websitepcsthitxongkhoivahatdieu640x640px-w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0eae4-8643-72ac-8425-d6e65b8ff7ff",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "01a0eae6-e6ef-7312-b3bc-d22bcca68196",
            "name": "Pizza Croissant 5 Loại Thịt Đặc Biệt & Rau Củ",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, kết hợp với 5 loại thịt đặc biệt cùng rau củ, mang đến phần topping phong phú và hương vị đậm đà.",
            "image": "/sites/thepizzacompany-vn/menu/434-tpclto-quy-4-26new-websitepcs5loaithitdacbietvaraucu640x640px-w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0eae6-e6ff-752f-9cb2-e237c81c1ba4",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "01a0eae9-7233-76b8-881d-0b6841851f8c",
            "name": "Pizza Croissant Gà Bơ Tỏi & Hạt Điều",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, được phủ ngập xốt phô mai, kết hợp hài hòa cùng cùng gà bơ tỏi và lá húng quế tây tươi thơm nức và hạt điều rang Việt Nam.",
            "image": "/sites/thepizzacompany-vn/menu/361-tpclto-quy-4-26new-websitepcspizzagabotoihatdieu640x640px-w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0eae9-7244-7294-a52c-379c75177eb9",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "01a0eaea-ec48-7255-bf5d-ecf528902028",
            "name": "Pizza Croissant Hải Sản Nhiệt Đới",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, kết hợp cùng hải sản và hương vị nhiệt đới, tạo nên phiên bản pizza mới mẻ và dễ thưởng thức.",
            "image": "/sites/thepizzacompany-vn/menu/300-tpclto-quy-4-26new-websitepcshaisannhietdoi640x640px-w320.avif",
            "price": 285000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0eaea-ec5b-74cb-8a9a-3e4bbd639777",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 285000
              }
            ],
            "options": []
          },
          {
            "id": "01a0eaec-60d4-710d-af37-73ca3529717b",
            "name": "Pizza Croissant Hải Sản Pesto Xanh",
            "description": "Đế bánh Pizza Croissant giòn xốp, nhẹ tênh, thơm bơ, được phủ ngập xốt Pesto Xanh mang đến hương vị thơm đặc trưng trên nền đế bánh mới.",
            "image": "/sites/thepizzacompany-vn/menu/85-tpclto-quy-4-26new-websitepcshaisanpestoxanh640x640px-w320.avif",
            "price": 295000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0eaec-60e1-76de-90ce-4a488c97163f",
                "name": "Kích thước Vừa 9'' - Đế viền Pizza Croissant",
                "price": 295000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "cong-thuc-dac-biet",
        "name": "CÔNG THỨC ĐẶC BIỆT",
        "items": [
          {
            "id": "016f5e66-e800-72a8-9050-75c5eabd2a50",
            "name": "Pizza Hải Sản Pesto Xanh",
            "description": "Tôm, thanh cua, mực và bông cải tươi ngon trên nền xốt Pesto Xanh.",
            "image": "/sites/thepizzacompany-vn/menu/69-tpc640x640pxpizzahaisanpestoxanh-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              },
              {
                "name": "Di Sản",
                "slug": "di-san",
                "image": "/sites/thepizzacompany-vn/menu/74-TPC_NHAN_48x48px_ICON-DI-SAN-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7289-bf7f-3ca8624ddbaa",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 265000
              },
              {
                "id": "016f5e66-e800-72bf-9f1f-46bc66613c90",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-72c7-b4f4-b56d3c467a43",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 315000
              },
              {
                "id": "016f5e66-e800-72d5-b1b1-df36fe590315",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 455000
              },
              {
                "id": "016f5e66-e800-72e0-9353-2f88c0d9cfbe",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-72f2-a969-efd7332c097a",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 525000
              },
              {
                "id": "016f5e66-e800-744f-acec-bac2737aef50",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 185000
              },
              {
                "id": "016f5e66-e800-72af-9ddd-f4d5b6482d3d",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 265000
              },
              {
                "id": "016f5e66-e800-7292-8989-3309d3742b2a",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 385000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e1a-90d0-3fc31ffd8d11",
            "name": "Pizza Hải Sản Pesto Xanh Full Topping",
            "description": "Tôm, thanh cua, mực full topping và bông cải tươi ngon trên nền xốt Pesto Xanh.",
            "image": "/sites/thepizzacompany-vn/menu/128-tpc640x640pxpizzahaisanpestoxanhfulltopping-w320.avif",
            "price": 205000,
            "kind": "product",
            "tags": [
              {
                "name": "Di Sản",
                "slug": "di-san",
                "image": "/sites/thepizzacompany-vn/menu/74-TPC_NHAN_48x48px_ICON-DI-SAN-copy-2-w48.avif"
              },
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7d0b-85c5-e490f7b13ef9",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 405000
              },
              {
                "id": "016f5e66-e800-7cc9-8e8e-51a7843742b3",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 285000
              },
              {
                "id": "016f5e66-e800-7cb0-afaf-a8e5b6abaa58",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 285000
              },
              {
                "id": "016f5e66-e800-7ce5-bf7f-85daa7e2f262",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-7d19-8a4a-9f589dcafc86",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 475000
              },
              {
                "id": "016f5e66-e800-7cd8-afaf-253c71d3cace",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 335000
              },
              {
                "id": "016f5e66-e800-7caf-90d0-2dec927eaaeb",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 205000
              },
              {
                "id": "016f5e66-e800-7d25-8a4a-72e97c34d25c",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 545000
              },
              {
                "id": "016f5e66-e800-7cf4-8646-46fc012cbc55",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 405000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "dac-san",
        "name": "ĐẶC SẢN",
        "items": [
          {
            "id": "016f5e66-e800-74e2-b333-7187715f88cf",
            "name": "Pizza 4 Cheese Dừa Non - Mật Hoa Dừa",
            "description": "4 loại phô mai trứ danh kết hợp cùng Dừa Việt Nam, dùng kèm với Mật Hoa Dừa.",
            "image": "/sites/thepizzacompany-vn/menu/245-tpc640x640pxpizza4cheeseduanon-mathoadua-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              },
              {
                "name": "Đặc biệt",
                "slug": "dac-biet",
                "image": "/sites/thepizzacompany-vn/menu/158-TPC_NHAN_48x48px_ICON-DAC-SAN-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7e45-8141-b7663f54eb5c",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-7e3d-8545-37eccba4dac5",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-7dd0-a969-c96af2e17bb1",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 185000
              },
              {
                "id": "016f5e66-e800-7df6-91d1-c166cd914946",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 265000
              },
              {
                "id": "016f5e66-e800-7e12-a7a7-885445eaecbe",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 315000
              },
              {
                "id": "016f5e66-e800-7e29-9f1f-830f6026233c",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7e7e-9c5c-d31908f49592",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 525000
              },
              {
                "id": "016f5e66-e800-7e66-8a8a-9781ecd9f41b",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 455000
              },
              {
                "id": "016f5e66-e800-7def-a5a5-85dc1518d082",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 265000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-74f0-9e5e-7fc2aec61435",
            "name": "Pizza 4 Cheese Dừa Non Tôm Nõn - Mật Hoa Dừa",
            "description": "Tôm, 4 loại phô mai trứ danh kết hợp cùng Dừa Việt Nam, dùng kèm với Mật Hoa Dừa.",
            "image": "/sites/thepizzacompany-vn/menu/530-tpc640x640pxpizza4cheeseduanontomnon-mathoadua-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              },
              {
                "name": "Đặc biệt",
                "slug": "dac-biet",
                "image": "/sites/thepizzacompany-vn/menu/158-TPC_NHAN_48x48px_ICON-DAC-SAN-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7f01-a7e7-982549609535",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-7efc-b5f5-f3e2c6b8ffb6",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7f47-aaea-61d31aa1cf40",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 525000
              },
              {
                "id": "016f5e66-e800-7e8a-8040-d5bbbd842920",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 185000
              },
              {
                "id": "016f5e66-e800-7f10-9818-b96b0a7ceae5",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 385000
              },
              {
                "id": "016f5e66-e800-7ea3-8000-dc184cd365d4",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 265000
              },
              {
                "id": "016f5e66-e800-7f3b-ac6c-52a9f203b775",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 455000
              },
              {
                "id": "016f5e66-e800-7ee2-8949-6eb1e336acab",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 315000
              },
              {
                "id": "016f5e66-e800-7e96-be7e-24b19a2f45e5",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 265000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "hai-san-cao-cap",
        "name": "HẢI SẢN CAO CẤP",
        "items": [
          {
            "id": "016f5e66-e800-72b1-a767-2f73e58b8f15",
            "name": "Pizza Hải Sản Cocktail",
            "description": "Tôm, cua, giăm bông và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/369-tpc640x640pxpizzahaisancocktail-w320.avif",
            "price": 175000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7223-9353-ff352d7e07be",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-70fe-9050-acbcf8fac4ac",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 305000
              },
              {
                "id": "016f5e66-e800-7110-8a8a-e44b5c9a58c3",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 175000
              },
              {
                "id": "016f5e66-e800-70c0-befe-ebe48e5840d1",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 445000
              },
              {
                "id": "016f5e66-e800-7100-9717-dc8b949ee0d6",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-70dc-8242-cb623ad5cc9d",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-70ef-9111-94ded110bf44",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 355000
              },
              {
                "id": "016f5e66-e800-70bc-9e5e-2ed590f13c76",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 515000
              },
              {
                "id": "016f5e66-e800-7238-9555-02b8dd022629",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 375000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-72cc-a767-113a0ed4961d",
            "name": "Pizza Hải Sản Cao Cấp",
            "description": "Tôm, cua, mực, nghêu và xốt Marinara.",
            "image": "/sites/thepizzacompany-vn/menu/734-tpc640x640pxpizzahaisancaocap-w320.avif",
            "price": 175000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7213-acac-4b7446d5c2f0",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-70ae-8f8f-d81097f00d12",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 175000
              },
              {
                "id": "016f5e66-e800-705c-a2a2-44eb6da53205",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 445000
              },
              {
                "id": "016f5e66-e800-709a-b232-67d2b4413978",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-704e-ad2d-90fc228eae8d",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 515000
              },
              {
                "id": "016f5e66-e800-706b-acac-b62af7147e95",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-7081-8d0d-a770adc91219",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 305000
              },
              {
                "id": "016f5e66-e800-7208-a222-62e8723240de",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-7077-a5e5-6094c7dd6b97",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 355000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-72ec-acec-d385d9a8aae5",
            "name": "Pizza Hải Sản Nhiệt Đới",
            "description": "Tôm, nghêu, mực, cua, dứa và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzahaisannhietoi-w320.avif",
            "price": 175000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7198-adad-6ede39528a8a",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 515000
              },
              {
                "id": "016f5e66-e800-71c1-b8b8-fb60931d999a",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 355000
              },
              {
                "id": "016f5e66-e800-71e8-ab2b-91a6131af29a",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-71b0-ab2b-a7663e77c8e0",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-7261-8a0a-ae283863e511",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-7272-a464-6462cf9c61fa",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-71fa-af6f-74bdb793294b",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 175000
              },
              {
                "id": "016f5e66-e800-71dc-9252-5b052d0a1106",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 305000
              },
              {
                "id": "016f5e66-e800-71a4-ab2b-0d1b0bb6d2a9",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 445000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-74d5-8383-f739a13b60a6",
            "name": "Pizza Tôm Cocktail",
            "description": "Tôm, nấm, dứa, cà chua và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/880-tpc640x640pxpizzatomcocktail-w320.avif",
            "price": 175000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-712c-8444-b80dc0ab1648",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 515000
              },
              {
                "id": "016f5e66-e800-713b-8080-788b1e16946d",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 445000
              },
              {
                "id": "016f5e66-e800-724a-86c6-94d0db840c3a",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-7252-9ada-9208e36a56b8",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-716b-bd7d-4901740d8ff7",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 305000
              },
              {
                "id": "016f5e66-e800-7159-9010-2ee81b647ecf",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 355000
              },
              {
                "id": "016f5e66-e800-718e-ac2c-4fa951cb2885",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 175000
              },
              {
                "id": "016f5e66-e800-717d-9797-679cc13ce20b",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-714f-9d9d-3249d6989dc0",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 375000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-771e-9f1f-be2dc68185ae",
            "name": "Pizza Tôm Bơ Tỏi",
            "description": "Bùng nổ hương vị với bánh pizza tôm nướng tươi mới chắc thịt và xốt bơ tỏi thơm lừng.",
            "image": "/sites/thepizzacompany-vn/menu/76-tpc640x640pxpizzatombotoi-w320.avif",
            "price": 175000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-733f-bcbc-d4fdccddf9b6",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 175000
              },
              {
                "id": "016f5e66-e800-72da-9414-510b16d636ce",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 355000
              },
              {
                "id": "016f5e66-e800-7310-9696-68d8d13da656",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 445000
              },
              {
                "id": "016f5e66-e800-72fe-adad-6981b0875a32",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-7296-83c3-b00be81054e4",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-72af-8e4e-b973a6090b87",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 255000
              },
              {
                "id": "016f5e66-e800-732d-a727-9d2bccc86f72",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 515000
              },
              {
                "id": "016f5e66-e800-72e8-9ede-2247dbc6d039",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 375000
              },
              {
                "id": "016f5e66-e800-72c7-af2f-c5fa2c9b3cf4",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 305000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "thap-cam-cao-cap",
        "name": "THẬP CẨM CAO CẤP",
        "items": [
          {
            "id": "016f5e66-e800-7234-a767-087e96d38d1f",
            "name": "Pizza Thịt Nguội Xúc Xích",
            "description": "Thịt nguội, xúc xích, dứa và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/904-tpc640x640pxpizzathitnguoixucxich-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7957-9c1c-09fa82e2f10f",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              },
              {
                "id": "016f5e66-e800-7919-aeee-b288a3d0f92f",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-793d-9b9b-860b3c3156cc",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-78f6-9ada-5e378e75e7a7",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7947-8585-35d7acf653a4",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7926-be7e-788f42ddcd70",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7dbb-8404-4b74b5d82dad",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-790f-9898-9706759e217c",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              },
              {
                "id": "016f5e66-e800-7da5-8040-0553d450cb0e",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7241-b8f8-56013267fd96",
            "name": "Pizza Thịt Xông Khói Đặc Biệt",
            "description": "Thịt giăm bông, thịt xông khói, ớt xanh và cà chua.",
            "image": "/sites/thepizzacompany-vn/menu/63-tpc640x640pxpizzathitxongkhoiacbiet-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-79c8-8444-d6e4b3c41b4e",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              },
              {
                "id": "016f5e66-e800-7994-a424-934a86aca3a7",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7ddc-b7f7-b611ed1ffdd8",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7973-8747-32b5f69d7783",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-79ad-aeee-831f32f65e74",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-79bd-a4a4-7147e5c915b9",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7dc7-b070-92c618ac2223",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7980-b2f2-d8c9d9fd9df8",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7962-aeee-703742d3440e",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7255-9090-52fd6da4cae6",
            "name": "Pizza Thịt Nguội Kiểu Canada",
            "description": "Thịt nguội và bắp ngọt.",
            "image": "/sites/thepizzacompany-vn/menu/863-tpc640x640pxpizzathitnguoikieucanada-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7def-b838-4204d5f8c2b0",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7a09-b232-acbfaded563a",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-79e4-aaea-373301071ef1",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-7a27-aa2a-7e5cd565f165",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7dfa-88c8-e254ba421aaa",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7a32-bdbd-a4c0dc9197fa",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              },
              {
                "id": "016f5e66-e800-7a19-bafa-9b0a7b9a6480",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-79fa-9010-478c386d9f34",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-79dd-aded-802cea434bf0",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-726b-bebe-48b7b0243dee",
            "name": "Pizza Gà Nướng 3 Vị",
            "description": "Gà nướng, gà bơ tỏi và gà ướp xốt nấm.",
            "image": "/sites/thepizzacompany-vn/menu/202-tpc640x640pxpizzaganuong3vi-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7b03-adad-eca5a4475bd2",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7ad7-8b4b-e6b2b2bbdbfd",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7ab0-94d4-811992a5499e",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              },
              {
                "id": "016f5e66-e800-7b18-b676-09466f2a3e95",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              },
              {
                "id": "016f5e66-e800-7e07-b5b5-3c01025001ce",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7af5-9595-d46273518e6a",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-7aeb-bb7b-20ad7f929552",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7ac5-b4b4-94ea5f0139f7",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-7e10-8505-def8e2b410c1",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7284-8e8e-558148ff9ac4",
            "name": "Pizza 5 Loại Thịt Đặc Biệt",
            "description": "Xúc xích lợn, bò đặc trưng của Ý, giăm bông và thịt xông khói.",
            "image": "/sites/thepizzacompany-vn/menu/746-tpc640x640pxpizza5loaithitacbiet-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7cf0-b4b4-64e5c8799659",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7d29-b9b9-a7b1ff8238fa",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              },
              {
                "id": "016f5e66-e800-7d0d-9ada-e4ab46a4cf1c",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-7e4d-8808-9727f76634e0",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7cc0-a020-1e2ce6515b38",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              },
              {
                "id": "016f5e66-e800-7d13-aa6a-7b411e968797",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7e52-95d5-a4f30544d0b8",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7cd8-9616-42519f91e215",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-7cef-b9f9-b4b49590219b",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7294-99d9-94af87d3acae",
            "name": "Pizza 5 Loại Thịt Đặc Biệt & Rau Củ",
            "description": "Xúc xích bò, giăm bông, thịt xông khói, ớt xanh và dứa.",
            "image": "/sites/thepizzacompany-vn/menu/255-tpc640x640pxpizza5loaithitacbietandraucu-w320.avif",
            "price": 165000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7c86-a525-bb5994f77738",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7e63-b9f9-0b854ff4b17c",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7c76-8181-487b735a6729",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7c57-bdbd-23c5ce2bdcd4",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 505000
              },
              {
                "id": "016f5e66-e800-7ca8-b9f9-722812468a85",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 245000
              },
              {
                "id": "016f5e66-e800-7e70-a2e2-61dc6cc35af2",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 365000
              },
              {
                "id": "016f5e66-e800-7c66-9b5b-a573e84b4e8c",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 435000
              },
              {
                "id": "016f5e66-e800-7c91-9555-1e255a081830",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 295000
              },
              {
                "id": "016f5e66-e800-7cb6-a424-d786afeb28c1",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 165000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "truyen-thong",
        "name": "TRUYỀN THỐNG",
        "items": [
          {
            "id": "016f5e66-e800-71e2-9818-8d5dfc1bb4da",
            "name": "Pizza Gà Nướng Dứa",
            "description": "Thịt gà và dứa.",
            "image": "/sites/thepizzacompany-vn/menu/575-tpc640x640pxpizzaganuongdua-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a99-a6a6-059b538773a7",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7aa4-abeb-bcd9fd46e70f",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-77b3-9292-7f47ac688d6e",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7a83-b070-a80c1fe6b674",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7a77-ab2b-83c2d930eb17",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-7a50-ac6c-c4c6e9cb5281",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-77af-9ada-b68e8e05bd57",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7a66-9393-d77c06ac215f",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7a44-a9a9-197a09a32a24",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-720f-acec-76ff3d191811",
            "name": "Pizza Xúc Xích Ý",
            "description": "Xúc xích kiểu Ý trên nền xốt cà chua.",
            "image": "/sites/thepizzacompany-vn/menu/773-tpc640x640pxpizzaxucxichy-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-790f-a222-ca3fd9fc2318",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7918-befe-974345cdb05b",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-7921-9616-16abe0260e07",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-7937-9d5d-433cd27170f0",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              },
              {
                "id": "016f5e66-e800-78b6-91d1-78b8080f5e63",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-78cd-aeae-01359288835a",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-78d0-bfbf-2ca441521504",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-78e2-9858-fa71436d00c2",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-78fe-97d7-ebb9a8f01a13",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7212-b676-61c759c4dcdc",
            "name": "Pizza Thịt Nguội & Nấm",
            "description": "Giăm bông và nấm.",
            "image": "/sites/thepizzacompany-vn/menu/727-tpc640x640pxpizzathitnguoiandnam-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-77d0-b6f6-14125e19b4e1",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-77c2-b131-cbb2a9e949c2",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7b35-8484-e9de6b135417",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              },
              {
                "id": "016f5e66-e800-7b6d-8444-dd9166bc1010",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7b85-8ccc-c4da951e3529",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-7b4f-8686-e591990a81db",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-7b72-86c6-b7a37dbda6b6",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7b5b-abab-7929161e5c3d",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-7b21-bf7f-7d1f5dbde946",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-722c-9f1f-1175a35ecd20",
            "name": "Pizza Hawaiian",
            "description": "Giăm bông, thịt muối và dứa.",
            "image": "/sites/thepizzacompany-vn/menu/332-tpc640x640pxpizzahawaiian-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7be4-b1f1-d97fce81da3f",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7bf2-b333-4bda5dc8cd3c",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-77e6-b6f6-d1b4090c5975",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7bc3-8b4b-ccd0770a42ee",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-77f7-b4f4-cce6ac3c4ee1",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7ba8-84c4-702854310b0a",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-7bdc-b2f2-e5a87f949b65",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7b92-b8f8-b66033b40d4b",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              },
              {
                "id": "016f5e66-e800-7bbf-9696-b9c6696d9625",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "pizza-chay",
        "name": "PIZZA CHAY",
        "items": [
          {
            "id": "016f5e66-e800-71f2-ad6d-b24b2ef4f14a",
            "name": "Pizza Phô Mai",
            "description": "Phô mai, phô mai và phô mai.",
            "image": "/sites/thepizzacompany-vn/menu/849-tpc640x640pxpizzaphomai-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7836-9494-59d5a9f5608b",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7898-b131-b88a1d2dc015",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-7828-afaf-6c51756f3e58",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-7850-91d1-368bf844e47e",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-78a9-8444-c99b489bd98d",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              },
              {
                "id": "016f5e66-e800-7883-8505-c46c09a1d03f",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-7840-9090-4dc0a40092d8",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7875-8040-2010383cc851",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7864-9919-68f8c54a9571",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-72f1-8bcb-2c83cfca1e0f",
            "name": "Pizza Rau Củ",
            "description": "Hành, ớt chuông, nấm, dứa và cà chua.",
            "image": "/sites/thepizzacompany-vn/menu/272-tpc640x640pxpizzaraucu-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7445-9454-a97fb93a0a33",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai xúc xích",
                "price": 325000
              },
              {
                "id": "016f5e66-e800-7451-a4e4-42031c18b88e",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai xúc xích",
                "price": 485000
              },
              {
                "id": "016f5e66-e800-7801-aeae-60a910c6d383",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7c09-8787-fcceadfce24a",
                "name": "Kích thước Lớn 12'' Đế Viền phô mai",
                "price": 415000
              },
              {
                "id": "016f5e66-e800-781f-9353-9680cee809bf",
                "name": "Kích thước Lớn 12'' Đế Cực mỏng",
                "price": 345000
              },
              {
                "id": "016f5e66-e800-7c3a-8080-1ac32534e8ab",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 225000
              },
              {
                "id": "016f5e66-e800-7c49-aa6a-48ccc40ccd0a",
                "name": "Kích thước Nhỏ 6'' Đế Dày",
                "price": 145000
              },
              {
                "id": "016f5e66-e800-7c29-90d0-2df62b33ca92",
                "name": "Kích thước Vừa 9'' Đế Viền phô mai",
                "price": 275000
              },
              {
                "id": "016f5e66-e800-7c1e-afaf-43f01a6979e2",
                "name": "Kích thước Lớn 12'' Đế Dày",
                "price": 345000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "pizza-caro",
        "name": "Pizza Caro",
        "items": [
          {
            "id": "016f5e66-e800-7a5c-8848-ef48f840adfd",
            "name": "Pizza Caro _ Xúc Xích Ý",
            "description": "Xúc xích, ớt chuông, hành tây, phô mai và xốt cà chua",
            "image": "/sites/thepizzacompany-vn/menu/551-tpc640x640pxpizzacaroxucxich-w320.avif",
            "price": 89000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-71f4-8f8f-3063a98aa2bd",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 89000
              },
              {
                "id": "016f5e66-e800-71e5-8b8b-23ce7bc82882",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 89000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a6d-9a9a-b7a576bc7171",
            "name": "Pizza Caro _ Giăm Bông Và Thịt Xông Khói",
            "description": "Thịt giăm bông, thịt xông khói, bắp, phô mai và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/992-tpc640x640pxpizzacarogiambongthitxongkhoi-w320.avif",
            "price": 89000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-71cd-a323-21ef85b05adf",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 89000
              },
              {
                "id": "016f5e66-e800-71d0-ad2d-24a64138d28d",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 89000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a7f-9d5d-af10409ba243",
            "name": "Pizza Caro _ Thanh Cua Và Xúc Xích Cocktail",
            "description": "Xúc xích xông khói, thanh cua, hành tây, dứa, phô mai và xốt Thousand Island",
            "image": "/sites/thepizzacompany-vn/menu/816-tpc640x640pxpizzacarothanhcuavaxucxichcocktailcopy-w320.avif",
            "price": 89000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-71ad-b4f4-4672a3d0be4a",
                "name": "Kích thước Vừa 9'' Đế Dày",
                "price": 89000
              },
              {
                "id": "016f5e66-e800-71bb-a060-24e0e022de36",
                "name": "Kích thước Vừa 9'' Đế Cực mỏng",
                "price": 89000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "my-y",
    "name": "MỲ Ý",
    "icon": "/sites/thepizzacompany-vn/menu/158-TPC_ICON_100x100px_MY-Y-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/961-tpcbannercatemyy2400x400pxcopy-w1024.avif",
    "groups": [
      {
        "id": "my-ypasta",
        "name": "Mỳ Ý/Pasta",
        "items": [
          {
            "id": "016f5e66-e800-7a5c-9353-5f1245ccbdd1",
            "name": "Mỳ Ý Cay Hải Sản",
            "description": "Mỳ ý với các loại hải sản tươi ngon cùng ớt và tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-cay-hai-san-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              },
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7ab4-b4f4-52097dbb3b0d",
                "name": "Mỳ Ý Cay Hải Sản",
                "price": 145000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a6d-98d8-8e9889520cf6",
            "name": "Mỳ Ý Chay Xốt Marinara",
            "description": "Mỳ ý áp chảo với xốt Marinara, nấm và cà chua đỏ.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-chay-xot-marinara-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7ac6-8aca-65fbfaaa35fd",
                "name": "Mỳ Ý Chay Xốt Marinara",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a70-b737-5cf9b5f165fc",
            "name": "Mỳ Ý Tôm Xốt Kem Cà Chua",
            "description": "Mỳ ý, tôm trên nền xốt kem cà chua.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-tom-xot-kem-ca-chua-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7ada-9616-cae590dfa10c",
                "name": "Mỳ Ý Tôm Xốt Kem Cà Chua",
                "price": 145000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a81-a565-4348da67dcf3",
            "name": "Mỳ Ý Cay Với Xúc Xích",
            "description": "Mỳ ý, xúc xích, thảo mộc, ngò gai và húng quế Ý.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-cay-voi-xuc-xich-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7ae1-8e4e-f03125dbd14f",
                "name": "Mỳ Ý Cay Với Xúc Xích",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a96-8d0d-14b52420b83e",
            "name": "Mỳ Ý Giăm Bông Và Nấm Với Xốt Kem",
            "description": "Mỳ ý, giăm bông, nấm cùng với xốt kem trắng.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-giam-bong-va-nam-voi-xot-kem-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7af0-acac-690a6a86d7b4",
                "name": "Mỳ Ý Giăm Bông Và Nấm Với Xốt Kem",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ab2-bcfc-8d2abe084823",
            "name": "Mỳ Ý Xốt Bò Bằm",
            "description": "Một phong cách xốt bò bằm đặc biệt.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-xot-bo-bam-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7b16-94d4-aea30e645232",
                "name": "Mỳ Ý Xốt Bò Bằm",
                "price": 145000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7523-8606-878a9ad9b576",
            "name": "Mỳ Ý Chay Xốt Kem Tươi",
            "description": "Mỳ ý chay thơm ngon với xốt kem và nấm.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-chay-xot-kem-tuoi-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-77c0-9656-c72094e1b056",
                "name": "Mỳ Ý Chay Xốt Kem Tươi",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7c22-a222-1da4164b465f",
            "name": "Mỳ Ý Pesto",
            "description": "Mỳ ý, tôm, mực hoà quyện trên nền xốt Pesto Xanh.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-pesto-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7489-9ddd-65992ca213fb",
                "name": "Mỳ Ý Pesto",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7c74-8484-125fdd5682d3",
            "name": "Mỳ Ý Nghêu Xốt Cay",
            "description": "Mỳ ý xốt cay nồng và vị ngọt thanh của nghêu.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-ngheu-xot-cay-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7888-8343-2cfa5c894cb0",
                "name": "Mỳ Ý Nghêu Xốt Cay",
                "price": 145000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7c81-a929-0737472d6926",
            "name": "Mỳ Ý Nghêu Xốt Húng Quế",
            "description": "Mỳ ý xốt húng quế và vị ngọt thanh của nghêu.",
            "image": "/sites/thepizzacompany-vn/menu/my-y-ngheu-xot-hung-que-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7871-b0f0-16f85a726429",
                "name": "Mỳ Ý Nghêu Xốt Húng Quế",
                "price": 145000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7cb0-a7a7-3bb4f882a6f5",
            "name": "Mỳ Ý Hải Sản Xốt Kem Chanh",
            "description": "Mỳ Ý Hải Sản Xốt Kem Chanh – Hương Vị Tinh Tế Từ The Pizza Company",
            "image": "/sites/thepizzacompany-vn/menu/my-y-hai-san-xot-kem-chanh-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              },
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7c6a-a1a1-cb05b14d5db2",
                "name": "Mỳ Ý Hải Sản Xốt Kem Chanh",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "01a0e741-aa60-73f3-a8b1-a6e2e1726c21",
            "name": "Mỳ Ý Gà BBQ Hạt Điều Xốt Kem",
            "description": "Mỳ Ý dai mềm mại, thấm đẫm xốt kem mịn màng cay nhẹ, bất ngờ hòa quyện cùng hạt điều nướng giòn, tạo nên trải nghiệm nhai độc đáo và thú vị và phô mai Parmesan tạo nên hương vị đậm đà nhưng cân bằng.",
            "image": "/sites/thepizzacompany-vn/menu/933-tpclto-quy-4-26new-websitemyygabbqhatdieu640x640px-w320.avif",
            "price": 145000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              },
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0e741-aa74-75e3-b40c-bc08a2cb8c8d",
                "name": "Mỳ Ý Gà BBQ Hạt Điều Xốt Kem",
                "price": 145000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "ga-ngon-vibe",
    "name": "GÀ NGON VĨBE",
    "icon": "/sites/thepizzacompany-vn/menu/563-TPC_ICON_100x100px_GA-NGON-VIBE-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/363-tpcbannercategangonvibe2400x400pxcopy2-w1024.avif",
    "groups": [
      {
        "id": "ga-xot-han",
        "name": "GÀ XỐT HÀN",
        "items": [
          {
            "id": "016f5e66-e800-78d4-8181-67ca6196a9f2",
            "name": "Cánh Gà Tẩm Bột Chiên Giòn (6 miếng)",
            "description": "Lớp bột tạo nên lớp vỏ giòn dai.",
            "image": "/sites/thepizzacompany-vn/menu/canh-ga-tam-bot-chien-gion--6-mieng--w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7538-a4e4-8ab0f4596de7",
                "name": "Cánh Gà Tẩm Bột Chiên Giòn (6 miếng)",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-795f-8e4e-4fbef987b9eb",
            "name": "Cánh Gà Tẩm Bột Chiên Giòn (10 miếng)",
            "description": "Lớp bột tạo nên lớp vỏ giòn dai.",
            "image": "/sites/thepizzacompany-vn/menu/canh-ga-tam-bot-chien-gion--10-mieng--w320.avif",
            "price": 205000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75c7-8ccc-4e508c507229",
                "name": "Cánh Gà Tẩm Bột Chiên Giòn (10 miếng)",
                "price": 205000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e5f-9b5b-14c4702811e9",
            "name": "Gà Giòn Xốt Cay (2 miếng)",
            "description": "Thịt gà mềm ngọt, giòn rụm, phủ xốt cay đậm chất Hàn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--2-mieng--w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7b86-b171-ab9bd028fbaf",
                "name": "Gà Giòn Xốt Cay (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e6f-afef-74db34bcd6ce",
            "name": "Gà Giòn Xốt Cay (5 miếng)",
            "description": "Thịt gà mềm ngọt, giòn rụm, phủ xốt cay đậm chất Hàn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7b93-8fcf-b1cfae5a60c7",
                "name": "Gà Giòn Xốt Cay (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e74-b1b1-02996714e9d0",
            "name": "Gà Giòn Xốt Cay (9 miếng)",
            "description": "Thịt gà mềm ngọt, giòn rụm, phủ xốt cay đậm chất Hàn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-cay--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7bad-b676-372bb877af25",
                "name": "Gà Giòn Xốt Cay (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e84-9191-4a51b2acc92c",
            "name": "Gà Giòn Xốt Tương Tỏi (2 miếng)",
            "description": "Những miếng gà pha chút vị the nhè nhẹ và mùi thơm của gừng, tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--2-mieng--w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7bb4-9f1f-cefe81a497bf",
                "name": "Gà Giòn Xốt Tương Tỏi (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e92-8545-0071eef37f9c",
            "name": "Gà Giòn Xốt Tương Tỏi (5 miếng)",
            "description": "Những miếng gà pha chút vị the nhè nhẹ và mùi thơm của gừng, tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7bc5-a060-56d2f00b94fd",
                "name": "Gà Giòn Xốt Tương Tỏi (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ea4-b030-1955d948730d",
            "name": "Gà Giòn Xốt Tương Tỏi (9 miếng)",
            "description": "Những miếng gà pha chút vị the nhè nhẹ và mùi thơm của gừng, tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-tuong-toi--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7bd8-9717-2eafd422911f",
                "name": "Gà Giòn Xốt Tương Tỏi (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ebb-be3e-d39a0651ac25",
            "name": "Gà Giòn Xốt Truyền Thống (2 miếng)",
            "description": "Gà tẩm bột chiên giòn rụm phủ lớp xốt truyền thống Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/497-tpc640x640pxgagionxottruyenthong2mieng-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              },
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7be5-a4e4-fa68a6a8f3e0",
                "name": "Gà Giòn Xốt Truyền Thống (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ecf-bc7c-f981d70756fd",
            "name": "Gà Giòn Xốt Truyền Thống (5 miếng)",
            "description": "Gà tẩm bột chiên giòn rụm phủ lớp xốt truyền thống Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-truyen-thong--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              },
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7bfe-a6e6-b746b39f02bf",
                "name": "Gà Giòn Xốt Truyền Thống (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ed2-8303-03b5b551ccab",
            "name": "Gà Giòn Xốt Truyền Thống (9 miếng)",
            "description": "Gà tẩm bột chiên giòn rụm phủ lớp xốt truyền thống Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-truyen-thong--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              },
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7c08-98d8-2c1b94873a91",
                "name": "Gà Giòn Xốt Truyền Thống (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-751e-bcfc-b74199c8b4e6",
            "name": "Khay Gà Tổng Hợp - Xốt Cay",
            "description": "Khay gà giòn phủ xốt đậm chất Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/66-tpc640x640pxkhaygatonghopxotcay-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-73af-8b0b-667e412fd9a8",
                "name": "Khay Gà Tổng Hợp - Xốt Cay",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-752a-8f4f-72afad59e579",
            "name": "Da Gà Giòn Phủ Xốt Cay",
            "description": "Lớp da gà giòn rụm thấm đẫm nước xốt mặn mà.",
            "image": "/sites/thepizzacompany-vn/menu/675-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Cay-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7391-b6b6-dc58834e63b3",
                "name": "Da Gà Giòn Phủ Xốt Cay",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7550-9111-8f39ba1de0bd",
            "name": "Gà Giòn Xốt Kem (2 miếng)",
            "description": "Những miếng gà cùng vị thơm béo của nước xốt kem.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--2-mieng--w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7363-b434-74aa3c5bcccf",
                "name": "Gà Giòn Xốt Kem (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7541-94d4-f6e056e80405",
            "name": "Gà Giòn Xốt Kem (5 miếng)",
            "description": "Những miếng gà cùng vị thơm béo của nước xốt kem.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-737a-be7e-0b2de054a30a",
                "name": "Gà Giòn Xốt Kem (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7533-bc7c-118e7abfecbb",
            "name": "Gà Giòn Xốt Kem (9 miếng)",
            "description": "Những miếng gà cùng vị thơm béo của nước xốt kem.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-kem--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7387-88c8-9456019bbfa9",
                "name": "Gà Giòn Xốt Kem (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7fd5-a4e4-b9f8e704570a",
            "name": "Khay Gà Tổng Hợp - Xốt Truyền Thống",
            "description": "Khay gà giòn phủ xốt đậm chất Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/0004144_trio-chicken-platter_-k-sauce-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7df0-8ece-248ef3e19802",
                "name": "Khay Gà Tổng Hợp - Xốt Truyền Thống",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7fe2-86c6-4c308270b70f",
            "name": "Khay Gà Tổng Hợp - Xốt Tương Tỏi",
            "description": "Khay gà giòn phủ xốt đậm chất Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/597-tpc640x640pxkhaygatonghopxottuongtoi-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7de8-b1f1-649e73f545ab",
                "name": "Khay Gà Tổng Hợp - Xốt Tương Tỏi",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7ff6-93d3-59df114d1fae",
            "name": "Da Gà Giòn Phủ Xốt Truyền Thống",
            "description": "Lớp da gà giòn rụm thấm đẫm nước xốt mặn mà.",
            "image": "/sites/thepizzacompany-vn/menu/567-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Truye--------n-Tho--------ng-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7ddf-8787-d1bd88bb453d",
                "name": "Da Gà Giòn Phủ Xốt Truyền Thống",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7001-af6f-fed404df67ba",
            "name": "Da Gà Giòn Phủ Xốt Tương Tỏi",
            "description": "Lớp da gà giòn rụm thấm đẫm nước xốt mặn mà.",
            "image": "/sites/thepizzacompany-vn/menu/230-TPC_640x640px_Da-Ga-----Gio----n-Phu-----Xo--------t-Tu----o----ng-To----i-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7dc7-9cdc-22db5485889c",
                "name": "Da Gà Giòn Phủ Xốt Tương Tỏi",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-76dd-8a0a-b0bd68f282cc",
            "name": "Gà Giòn Xốt Bơ Tỏi (2 miếng)",
            "description": "Thịt gà mọng nước với lớp da áo bột mỏng tang giòn rụm, phủ xốt bơ tỏi đậm đà và tỏi phi vàng giòn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--2-mieng--w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7355-afaf-44cc4239efbd",
                "name": "Gà Giòn Xốt Bơ Tỏi (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-76e8-84c4-0ee723a391df",
            "name": "Gà Giòn Xốt Bơ Tỏi (5 miếng)",
            "description": "Thịt gà mọng nước với lớp da áo bột mỏng tang giòn rụm, phủ xốt bơ tỏi đậm đà và tỏi phi vàng giòn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-736e-9555-78f590801569",
                "name": "Gà Giòn Xốt Bơ Tỏi (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-76f1-8646-04ba54339d4b",
            "name": "Gà Giòn Xốt Bơ Tỏi (9 miếng)",
            "description": "Thịt gà mọng nước với lớp da áo bột mỏng tang giòn rụm, phủ xốt bơ tỏi đậm đà và tỏi phi vàng giòn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-xot-bo-toi--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7378-89c9-96706fbb5a6a",
                "name": "Gà Giòn Xốt Bơ Tỏi (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          }
        ]
      },
      {
        "id": "ga-bbq",
        "name": "GÀ BBQ",
        "items": [
          {
            "id": "016f5e66-e800-78cd-b9b9-f7d3adbec0b1",
            "name": "Cánh Gà Nướng BBQ (6 miếng)",
            "description": "Cánh gà nướng thấm vị với lớp da mỏng giòn.",
            "image": "/sites/thepizzacompany-vn/menu/74-TPC_640x640px_C----nh-G-----N----------ng-BBQ--6-mi------ng--w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-751e-9797-cbb41d7da65f",
                "name": "Cánh Gà Nướng BBQ (6 miếng)",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-78e2-8686-c9820b0c1c39",
            "name": "Cánh Gà Nướng BBQ (10 miếng)",
            "description": "Cánh gà nướng thấm vị với lớp da mỏng giòn.",
            "image": "/sites/thepizzacompany-vn/menu/canh-ga-nuong-bbq--10-mieng--w320.avif",
            "price": 205000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7543-9353-df386e07b56b",
                "name": "Cánh Gà Nướng BBQ (10 miếng)",
                "price": 205000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-79ef-a525-4ec87fd41410",
            "name": "Khai Vị Tổng Hợp (Cánh Gà Nướng BBQ)",
            "description": "Cánh gà nướng BBQ + Khoai tây chiên + Bánh mì bơ tỏi",
            "image": "/sites/thepizzacompany-vn/menu/0004137_platter-bbq-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-765d-bd7d-ebe6ed4ea75c",
                "name": "Khai Vị Tổng Hợp (Cánh Gà Nướng BBQ)",
                "price": 185000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-72e8-9191-caa7bd942293",
            "name": "Gà Nướng BBQ Vắt Chanh (2 miếng)",
            "description": "Thịt gà thấm đẫm gia vị, da gà màu vàng ươm bắt mắt.",
            "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--2-mieng--w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7703-93d3-2a2e218c56a4",
                "name": "Gà Nướng BBQ Vắt Chanh (2 miếng)",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-72f8-b939-7e7c93136aeb",
            "name": "Gà Nướng BBQ Vắt Chanh (5 miếng)",
            "description": "Thịt gà thấm đẫm gia vị, da gà màu vàng ươm bắt mắt.",
            "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--5-mieng--w320.avif",
            "price": 275000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7710-a868-9f2463ab72fa",
                "name": "Gà Nướng BBQ Vắt Chanh (5 miếng)",
                "price": 275000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7301-9090-e7989e6b501b",
            "name": "Gà Nướng BBQ Vắt Chanh (9 miếng)",
            "description": "Thịt gà thấm đẫm gia vị, da gà màu vàng ươm bắt mắt.",
            "image": "/sites/thepizzacompany-vn/menu/ga-nuong-bbq-vat-chanh--9-mieng--w320.avif",
            "price": 465000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7726-b4b4-0fa4df23b63b",
                "name": "Gà Nướng BBQ Vắt Chanh (9 miếng)",
                "price": 465000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "khai-vi",
    "name": "KHAI VỊ",
    "icon": "/sites/thepizzacompany-vn/menu/893-TPC_ICON_100x100px_KHAI-VI-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/954-tpcbannercatekhaivi2400x400pxcopy3-w1024.avif",
    "groups": [
      {
        "id": "khai-vi",
        "name": "Khai Vị",
        "items": [
          {
            "id": "016f5e66-e800-7900-a969-1e56eb1258da",
            "name": "Bánh Mì Bơ Tỏi",
            "description": "Một lớp bơ tỏi thơm ngon trên các lát bánh mì nướng.",
            "image": "/sites/thepizzacompany-vn/menu/banh-mi-bo-toi-w320.avif",
            "price": 60000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7560-a8e8-7ae86538a2e2",
                "name": "Bánh Mì Bơ Tỏi",
                "price": 60000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-791a-9b5b-dc32186976a0",
            "name": "Bánh Mì Bơ Tỏi Phủ Phô Mai",
            "description": "Lát bánh mì nướng được phủ 1 lớp bơ tỏi phô mai thơm béo.",
            "image": "/sites/thepizzacompany-vn/menu/banh-mi-bo-toi-phu-pho-mai-w320.avif",
            "price": 70000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7571-8a0a-c2b72bd51607",
                "name": "Bánh Mì Bơ Tỏi Phủ Phô Mai",
                "price": 70000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7927-a929-7e182266bb17",
            "name": "Khoai Tây Chiên",
            "description": "Khoai tây sợi được tẩm một lớp muối thấm vị.",
            "image": "/sites/thepizzacompany-vn/menu/khoai-tay-chien-w320.avif",
            "price": 80000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7581-a8a8-6888f667a535",
                "name": "Khoai Tây Chiên",
                "price": 80000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7932-b1b1-abd0f2fd26ec",
            "name": "Mực Chiên Giòn",
            "description": "Mực tẩm bột chiên giòn dùng kèm xốt ngò tây.",
            "image": "/sites/thepizzacompany-vn/menu/muc-chien-gion-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7597-8141-30de8d89a3da",
                "name": "Mực Chiên Giòn",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7945-aeae-4eea1c5c64f5",
            "name": "Giỏ Khoai Tây Chiên",
            "description": "Sự kết hợp nhiều kiểu chế biến khoai tây.",
            "image": "/sites/thepizzacompany-vn/menu/gio-khoai-tay-chien-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75a2-a8e8-05750337c021",
                "name": "Giỏ Khoai Tây Chiên",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-78f2-8e0e-dc693b9754ca",
            "name": "Bánh Mì Que Nướng",
            "description": "Bánh mì được làm từ đế bột của Pizza và dùng kèm xốt Cocktail.",
            "image": "/sites/thepizzacompany-vn/menu/banh-mi-que-nuong-w320.avif",
            "price": 70000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7553-b070-be6e001fce0f",
                "name": "Bánh Mì Que Nướng",
                "price": 70000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7965-9050-ffb258c0f6e2",
            "name": "Bánh Kẹp Nướng Mexico",
            "description": "Bánh nhân gà nướng bơ tỏi phô mai dùng kèm xốt cocktail.",
            "image": "/sites/thepizzacompany-vn/menu/banh-kep-nuong-mexico-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75d1-b4b4-e9afb94a2f96",
                "name": "Bánh Kẹp Nướng Mexico",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7970-81c1-24afa4ef4636",
            "name": "Tôm Bơ Tỏi Và Bánh Mì Nướng",
            "description": "Tôm tươi đút lò dùng kèm bánh mì nướng bơ tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/tom-bo-toi-va-banh-mi-nuong-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              },
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75ec-bebe-235af690b04f",
                "name": "Tôm Bơ Tỏi Và Bánh Mì Nướng",
                "price": 135000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7985-8303-84be8c9fff00",
            "name": "Bánh Phô Mai Xoắn",
            "description": "Phô mai trắng được nướng với bơ, tỏi và dùng kèm xốt Cocktail.",
            "image": "/sites/thepizzacompany-vn/menu/banh-pho-mai-xoan-w320.avif",
            "price": 125000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75fe-9b9b-a9770ee5d925",
                "name": "Bánh Phô Mai Xoắn",
                "price": 125000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-79df-87c7-04862ebc1816",
            "name": "Khai Vị Tổng Hợp (Cánh Gà Tẩm Bột Chiên Giòn)",
            "description": "Cánh gà tẩm bột chiên giòn + Khoai tây chiên + Bánh mì bơ tỏi",
            "image": "/sites/thepizzacompany-vn/menu/0004138_platter-ccw-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7641-9a1a-bbdfbee2c65f",
                "name": "Khai Vị Tổng Hợp (Cánh Gà Tẩm Bột Chiên Giòn)",
                "price": 185000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-79ef-a525-4ec87fd41410",
            "name": "Khai Vị Tổng Hợp (Cánh Gà Nướng BBQ)",
            "description": "Cánh gà nướng BBQ + Khoai tây chiên + Bánh mì bơ tỏi",
            "image": "/sites/thepizzacompany-vn/menu/0004137_platter-bbq-w320.avif",
            "price": 185000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-765d-bd7d-ebe6ed4ea75c",
                "name": "Khai Vị Tổng Hợp (Cánh Gà Nướng BBQ)",
                "price": 185000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-76f1-85c5-4842261c45f5",
            "name": "Gà Giòn Không Xương",
            "description": "Gà giòn tan với xốt Cocktail thơm ngậy.",
            "image": "/sites/thepizzacompany-vn/menu/ga-gion-khong-xuong-w320.avif",
            "price": 105000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-73e4-9515-32060f20fda8",
                "name": "Gà Giòn Không Xương",
                "price": 105000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-717a-af2f-8b4bb6e614e9",
            "name": "Gà Popcorn",
            "description": "Gà viên tẩm bột chiên giòn.",
            "image": "/sites/thepizzacompany-vn/menu/ga-popcorn-w320.avif",
            "price": 105000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7dfe-ac2c-00ae6079df36",
                "name": "Gà Popcorn",
                "price": 105000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7fd5-a4e4-b9f8e704570a",
            "name": "Khay Gà Tổng Hợp - Xốt Truyền Thống",
            "description": "Khay gà giòn phủ xốt đậm chất Hàn Quốc.",
            "image": "/sites/thepizzacompany-vn/menu/0004144_trio-chicken-platter_-k-sauce-w320.avif",
            "price": 155000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7df0-8ece-248ef3e19802",
                "name": "Khay Gà Tổng Hợp - Xốt Truyền Thống",
                "price": 155000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7df2-aa6a-57a3cd5e9be4",
            "name": "Khay Sườn Nướng BBQ (Cỡ Vừa)",
            "description": "Sườn nướng BBQ với khoai tây chiên.",
            "image": "/sites/thepizzacompany-vn/menu/khay-suon-nuong-bbq--co-vua--w320.avif",
            "price": 345000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7664-93d3-b32a85cec044",
                "name": "Khay Sườn Nướng BBQ (Cỡ Vừa)",
                "price": 345000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e07-8101-e248e2a5d55c",
            "name": "Khay Sườn Nướng BBQ (Cỡ Lớn)",
            "description": "Sườn nướng BBQ với khoai tây chiên",
            "image": "/sites/thepizzacompany-vn/menu/khay-suon-nuong-bbq--co-lon--w320.avif",
            "price": 595000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7675-adad-8a7aa3788746",
                "name": "Khay Sườn Nướng BBQ (Cỡ Lớn)",
                "price": 595000
              }
            ],
            "options": []
          },
          {
            "id": "01a0e743-2b58-77cc-8a10-783e23891456",
            "name": "Bánh Croissant Cuộn Phô Mai Xúc Xích",
            "description": "Bánh Croissant kết hợp giữa vỏ bánh Croissant giòn và phô mai kéo sợi cùng xúc xích tạo nên hương vị thỏa mãn và đậm đà khó cưỡng.",
            "image": "/sites/thepizzacompany-vn/menu/777-tpclto-quy-4-26new-websitebanhcroissantcuonxucxich640x640px-w320.avif",
            "price": 135000,
            "kind": "product",
            "tags": [
              {
                "name": "Mới",
                "slug": "moi",
                "image": "/sites/thepizzacompany-vn/menu/236-TPC_NHAN_48x48px_MOI-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "01a0e743-2b68-70ba-a858-dbdee43614c1",
                "name": "Bánh Croissant Cuộn Phô Mai Xúc Xích",
                "price": 135000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "salad",
    "name": "SALAD",
    "icon": "/sites/thepizzacompany-vn/menu/625-TPC_ICON_100x100px_SALAD-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/465-tpcbannercatesalad2400x400pxcopy4-w1024.avif",
    "groups": [
      {
        "id": "salad",
        "name": "Salad",
        "items": [
          {
            "id": "016f5e66-e800-7a0f-8c0c-4c6c0fff9471",
            "name": "Salad Đặc Sắc",
            "description": "Salad rau và trái cây tươi dùng kèm xốt kem.",
            "image": "/sites/thepizzacompany-vn/menu/salad-dac-sac-w320.avif",
            "price": 95000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a53-85c5-a1e889548efa",
                "name": "Kích thước Lớn 12''",
                "price": 180000
              },
              {
                "id": "016f5e66-e800-7a43-ac2c-393ea9c82df3",
                "name": "Kích thước Vừa 9''",
                "price": 95000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a18-a929-e33a5e8c2ed1",
            "name": "Salad Trộn Dầu Giấm",
            "description": "Rau với xốt dầu giấm.",
            "image": "/sites/thepizzacompany-vn/menu/salad-tron-dau-giam-w320.avif",
            "price": 95000,
            "kind": "product",
            "tags": [
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a7b-8949-7b77384ea0e6",
                "name": "Kích thước Lớn 12''",
                "price": 180000
              },
              {
                "id": "016f5e66-e800-7a63-94d4-6729c7eec0f1",
                "name": "Kích thước Vừa 9''",
                "price": 95000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7a29-8484-46ba5afa8c3d",
            "name": "Salad Trộn Xốt Caesar",
            "description": "Rau với xốt Caesar.",
            "image": "/sites/thepizzacompany-vn/menu/salad-tron-xot-caesar-w320.avif",
            "price": 95000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              },
              {
                "name": "Chay",
                "slug": "chay",
                "image": "/sites/thepizzacompany-vn/menu/687-TPC_NHAN_48x48px_CHAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a2a-a1a1-0eee65661322",
                "name": "Kích thước Vừa 9''",
                "price": 95000
              },
              {
                "id": "016f5e66-e800-7a33-aeee-94f1a11d6bcc",
                "name": "Kích thước Lớn 12''",
                "price": 180000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7662-92d2-6c9a4bd468f5",
            "name": "Salad Gà Giòn Không Xương",
            "description": "Salad gà giòn với trứng cút, thịt xông khói, phô mai và xốt Thousand Island.",
            "image": "/sites/thepizzacompany-vn/menu/salad-ga-gion-khong-xuong-w320.avif",
            "price": 105000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-76ae-bafa-48aec1a28b78",
                "name": "Kích thước Vừa 9''",
                "price": 105000
              },
              {
                "id": "016f5e66-e800-7696-b030-21dbadd47a56",
                "name": "Kích thước Lớn 12''",
                "price": 190000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7670-9d5d-739be21c0a57",
            "name": "Salad Da Cá Hồi Giòn",
            "description": "Salad với da cá hồi giòn với bắp cải, cà chua, ngô với xốt Yuzu.",
            "image": "/sites/thepizzacompany-vn/menu/salad-da-ca-hoi-gion-w320.avif",
            "price": 105000,
            "kind": "product",
            "tags": [
              {
                "name": "Ngon",
                "slug": "ngon",
                "image": "/sites/thepizzacompany-vn/menu/879-TPC_NHAN_48x48px_Chef-Recommend-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-75a9-89c9-a5a34019f8e0",
                "name": "Kích thước Lớn 12''",
                "price": 190000
              },
              {
                "id": "016f5e66-e800-75b6-b5b5-04611a909305",
                "name": "Kích thước Vừa 9''",
                "price": 105000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7c92-a0a0-97bcd0b8cb10",
            "name": "Salad Tôm Xốt Kem Chanh",
            "description": "Salad Tôm Xốt Kem Chanh – Thanh Mát Hương Vị Tết",
            "image": "/sites/thepizzacompany-vn/menu/salad-tom-xot-kem-chanh-w320.avif",
            "price": 105000,
            "kind": "product",
            "tags": [
              {
                "name": "Bán Chạy",
                "slug": "ban-chay",
                "image": "/sites/thepizzacompany-vn/menu/284-TPC_NHAN_48x48px_Best-Seller-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7c5e-b2f2-b3b2dd21babe",
                "name": "Kích thước Lớn 12''",
                "price": 190000
              },
              {
                "id": "016f5e66-e800-7c44-b878-d4e37198977c",
                "name": "Kích thước Vừa 9''",
                "price": 105000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "nui-bo-lo",
    "name": "NUI BỎ LÒ",
    "icon": "/sites/thepizzacompany-vn/menu/438-TPC_ICON_100x100px_NUI-BO-LO-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/459-tpcbannercatenuibolo2400x400pxcopy5-w1024.avif",
    "groups": [
      {
        "id": "nui-bo-lo",
        "name": "Nui Bỏ Lò",
        "items": [
          {
            "id": "016f5e66-e800-7e15-9393-9e7dc5355dde",
            "name": "Nui Bỏ Lò Phô Mai Gà Nướng BBQ Xốt Hương Nhu",
            "description": "Thịt gà BBQ xốt hương nhu, rau quế, ớt, hành tây và tỏi.",
            "image": "/sites/thepizzacompany-vn/menu/nui-bo-lo-pho-mai-ga-nuong-bbq-xot-huong-nhu-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a12-9ede-9d54992178cd",
                "name": "Nui Bỏ Lò Phô Mai Gà Nướng BBQ Xốt Hương Nhu",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e2d-a363-a60688daadaa",
            "name": "Nui Bỏ Lò Phô Mai Hải Sản Xốt Hương Nhu",
            "description": "Hải sản tươi ngon xốt hương nhu.",
            "image": "/sites/thepizzacompany-vn/menu/nui-bo-lo-pho-mai-hai-san-xot-huong-nhu-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [
              {
                "name": "Cay",
                "slug": "cay",
                "image": "/sites/thepizzacompany-vn/menu/654-TPC_NHAN_48x48px_CAY-copy-2-w48.avif"
              }
            ],
            "variants": [
              {
                "id": "016f5e66-e800-7a0f-afef-ddfca939e723",
                "name": "Nui Bỏ Lò Phô Mai Hải Sản Xốt Hương Nhu",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e3c-b070-72d90a0bc2fb",
            "name": "Nui Bỏ Lò Phô Mai Rau Củ Xốt Kem",
            "description": "Rau củ xốt kem phủ phô mai.",
            "image": "/sites/thepizzacompany-vn/menu/nui-bo-lo-pho-mai-rau-cu-xot-kem-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-79f6-98d8-23ca3e579274",
                "name": "Nui Bỏ Lò Phô Mai Rau Củ Xốt Kem",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e4b-a6e6-e62e52efb78d",
            "name": "Nui Bỏ Lò Phô Mai Gà Bơ Tỏi Xốt Kem",
            "description": "Gà bơ tỏi, nấm và lá mùi tây xốt kem phủ phô mai.",
            "image": "/sites/thepizzacompany-vn/menu/nui-bo-lo-pho-mai-ga-bo-toi-xot-kem-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-79eb-81c1-329dd3537c45",
                "name": "Nui Bỏ Lò Phô Mai Gà Bơ Tỏi Xốt Kem",
                "price": 90000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7e55-9c5c-c20e6eaf1ee6",
            "name": "Nui Bỏ Lò Phô Mai Thịt Nguội & Nấm Xốt Kem",
            "description": "Thịt nguội và nấm xốt kem phủ phô mai.",
            "image": "/sites/thepizzacompany-vn/menu/nui-bo-lo-pho-mai-thit-nguoi-nam-xot-kem-w320.avif",
            "price": 90000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-79dd-8707-69e3fdc34bd6",
                "name": "Nui Bỏ Lò Phô Mai Thịt Nguội & Nấm Xốt Kem",
                "price": 90000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  },
  {
    "id": "thuc-uong",
    "name": "THỨC UỐNG",
    "icon": "/sites/thepizzacompany-vn/menu/816-TPC_ICON_100x100px_THUC-UONG-w64.avif",
    "banner": "/sites/thepizzacompany-vn/menu/519-tpcbannercatethucuong2400x400pxcopy6-w1024.avif",
    "groups": [
      {
        "id": "thuc-uong",
        "name": "Thức Uống",
        "items": [
          {
            "id": "016f5e66-e800-7af7-ba3a-8f81f495d87e",
            "name": "Pepsi Lon",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/pepsi-lon-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7b63-af2f-343c9de28124",
                "name": "Pepsi Lon",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7b10-a626-01af7e7feacf",
            "name": "Aquafina Chai",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/aquafina-chai-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7bca-bcfc-06ae0b6eb198",
                "name": "Aquafina Chai",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7b21-8101-70073689661a",
            "name": "Bia Heineken",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/bia-heineken-w320.avif",
            "price": 50000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7bd0-b0f0-26fa6c37ef9a",
                "name": "Bia Heineken",
                "price": 50000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7565-a525-fde2b1325b33",
            "name": "7Up Lon",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/7up-lon-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7810-9ddd-959d8fddc92e",
                "name": "7Up Lon",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-757d-a424-6e711e70b26c",
            "name": "Bia 333",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/bia-333-w320.avif",
            "price": 50000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7828-b434-c47176cc91da",
                "name": "Bia 333",
                "price": 50000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-75db-b575-8ad6083d819a",
            "name": "Pepsi 1.5l Chai",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/pepsi-1-5l-chai-w320.avif",
            "price": 50000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-78fb-9a9a-95bffd5f62f3",
                "name": "Pepsi 1.5l Chai",
                "price": 50000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-75e6-9ddd-fc2283d42441",
            "name": "7Up 1.5l Chai",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/7up-1-5l-chai-w320.avif",
            "price": 50000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7908-8606-ea08b0fbdcbe",
                "name": "7Up 1.5l Chai",
                "price": 50000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-782c-baba-4409a28acef1",
            "name": "Pepsi Không Đường",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/pepsi-khong-duong-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7c24-9fdf-8f42546136a7",
                "name": "Pepsi Không Đường",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-726a-bc3c-e36bdff535d3",
            "name": "Pepsi Không Đường Vị Chanh",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/pepsi-khong-duong-vi-chanh-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7cb7-adad-edf8295d266f",
                "name": "Pepsi Không Đường Vị Chanh",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-750e-8787-8272481b1420",
            "name": "Mirinda Soda Kem Lon",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/mirinda-soda-kem-lon-w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7a4b-bb7b-12e79dc9d326",
                "name": "Mirinda Soda Kem Lon",
                "price": 30000
              }
            ],
            "options": []
          },
          {
            "id": "016f5e66-e800-7070-9bdb-79b8255c0917",
            "name": "Trà Chanh Yuzu TEA+ (Chai)",
            "description": "",
            "image": "/sites/thepizzacompany-vn/menu/0004746_lemon-yuzu-oolong-tea-bottle--w320.avif",
            "price": 30000,
            "kind": "product",
            "tags": [],
            "variants": [
              {
                "id": "016f5e66-e800-7614-b979-e321430ae664",
                "name": "Trà Chanh Yuzu TEA+ (Chai)",
                "price": 30000
              }
            ],
            "options": []
          }
        ]
      }
    ]
  }
]

export const menuCategories = [
  {
    "id": "combo",
    "name": "KHUYẾN MÃI",
    "icon": "/sites/thepizzacompany-vn/menu/730-TPC_ICON_100x100px_KHUYEN-MAI-w64.avif"
  },
  {
    "id": "moi",
    "name": "FRENCH CROISSANT PIZZA",
    "icon": "/sites/thepizzacompany-vn/menu/787-tpcicon100x100pxfrenchcroissantpizzaicon-w64.avif",
    "tag": "moi"
  },
  {
    "id": "pizza-caro",
    "name": "PIZZA CARO",
    "icon": "/sites/thepizzacompany-vn/menu/416-tpcicon100x100pxpizzacaro-w64.avif"
  },
  {
    "id": "ban-chay",
    "name": "BÁN CHẠY",
    "icon": "/sites/thepizzacompany-vn/menu/186-TPC_ICON_100x100px_DAM-AN-NGON-w64.avif",
    "tag": "ban-chay"
  },
  {
    "id": "pizza",
    "name": "PIZZA",
    "icon": "/sites/thepizzacompany-vn/menu/15-TPC_ICON_100x100px_PIZZA-w64.avif"
  },
  {
    "id": "my-y",
    "name": "MỲ Ý",
    "icon": "/sites/thepizzacompany-vn/menu/158-TPC_ICON_100x100px_MY-Y-w64.avif"
  },
  {
    "id": "ga-ngon-vibe",
    "name": "GÀ NGON VĨBE",
    "icon": "/sites/thepizzacompany-vn/menu/563-TPC_ICON_100x100px_GA-NGON-VIBE-w64.avif"
  },
  {
    "id": "khai-vi",
    "name": "KHAI VỊ",
    "icon": "/sites/thepizzacompany-vn/menu/893-TPC_ICON_100x100px_KHAI-VI-w64.avif"
  },
  {
    "id": "salad",
    "name": "SALAD",
    "icon": "/sites/thepizzacompany-vn/menu/625-TPC_ICON_100x100px_SALAD-w64.avif"
  },
  {
    "id": "nui-bo-lo",
    "name": "NUI BỎ LÒ",
    "icon": "/sites/thepizzacompany-vn/menu/438-TPC_ICON_100x100px_NUI-BO-LO-w64.avif"
  },
  {
    "id": "thuc-uong",
    "name": "THỨC UỐNG",
    "icon": "/sites/thepizzacompany-vn/menu/816-TPC_ICON_100x100px_THUC-UONG-w64.avif"
  },
  {
    "id": "chay",
    "name": "CHAY",
    "icon": "/sites/thepizzacompany-vn/menu/238-TPC_ICON_100x100px_CHAY-w64.avif",
    "tag": "chay"
  },
  {
    "id": "cay",
    "name": "CAY",
    "icon": "/sites/thepizzacompany-vn/menu/779-TPC_ICON_100x100px_CAY-w64.avif",
    "tag": "cay"
  }
]

export const heroSlides = [
  {
    "id": "french-croissant-pizza-by-the-pizza-company",
    "image": "/sites/thepizzacompany-vn/menu/852-tpclto-quy-4-26new-websitecoverweb2400x960px-w1200.avif",
    "alt": "FRENCH CROISSANT PIZZA by The Sea's Crown"
  },
  {
    "id": "tiet-kiem-50percent-khi-mua-pizza-thu-2",
    "image": "/sites/thepizzacompany-vn/menu/808-tpchde50coverweb2400x960px-w1200.avif",
    "alt": "Tiết kiệm 50% pizza thứ 2 khi mua kèm nước"
  },
  {
    "id": "sinh-nhat-ron-rang-be-cuoi-gion-tan",
    "image": "/sites/thepizzacompany-vn/menu/366-tpckidpizzacoverweb2400x960px-w1200.avif",
    "alt": "Sinh Nhật Rộn Ràng"
  },
  {
    "id": "combo-pizza-caro",
    "image": "/sites/thepizzacompany-vn/menu/11-95-tpcpizzacarocoverweb2400x960px-w1200.avif",
    "alt": "Combo Pizza Caro"
  },
  {
    "id": "mua-1-tang-1-chai-pet-15l",
    "image": "/sites/thepizzacompany-vn/menu/159-tpcpepsicoverweb2400x960px-w1200.avif",
    "alt": "Mua 1 Tặng 1 Chai PET 1.5L"
  },
  {
    "id": "web-moi-qua-xin-tang-pizza-co-vua-cho-don-hang-tu-350000d",
    "image": "/sites/thepizzacompany-vn/menu/985-tpcwebmi-quxn2400x960px-w1200.avif",
    "alt": "WEB MỚI, QUÀ XỊN - Tặng Pizza Cỡ Vừa cho đơn hàng từ 350.000đ"
  }
]

export const allMenuItems = Array.from(new Map(menuSections.flatMap(section => section.groups.flatMap(group => group.items)).map(item => [item.id, item])).values())
