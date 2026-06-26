import type { Character, Lesson, Product } from '../types/app'

const productImage = '/assets/2.png'

export const characters: Character[] = [
  {
    id: 'thuc-phan',
    name: 'Thục Phán',
    type: 'Vua',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    image: '/assets/thucphan.png',
    blurb: 'Người sáng lập nước Âu Lạc và để lại dấu ấn trong thành Cổ Loa.',
  },
  {
    id: 'cao-lo',
    name: 'Cao Lỗ',
    type: 'Tướng lĩnh',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    image: '/assets/caolo.png',
    blurb: 'Danh tướng nổi tiếng với tài chế tạo nỏ thần và chiến lược quân sự.',
  },
  {
    id: 'my-chau',
    name: 'Mỵ Châu',
    type: 'Công chúa',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    image: '/assets/mychau.png',
    blurb: 'Nhân vật gắn với câu chuyện bi tráng về nước Âu Lạc.',
  },
  {
    id: 'hai-ba-trung',
    name: 'Hai Bà Trưng',
    type: 'Anh hùng',
    grade: 'Lớp 6',
    period: 'Trưng Vương',
    image: '/assets/haibatrung.png',
    blurb: 'Biểu tượng quật khởi chống Bắc thuộc và tinh thần độc lập dân tộc.',
  },
  {
    id: 'trieu-thi-trinh',
    name: 'Triệu Thị Trinh',
    type: 'Anh hùng',
    grade: 'Lớp 6',
    period: 'Bắc Thuộc',
    image: '/assets/trieuthitrinh.png',
    blurb: 'Nữ anh hùng tiêu biểu với ý chí chống ách đô hộ phương Bắc.',
  },
  {
    id: 'ngo-quyen',
    name: 'Ngô Quyền',
    type: 'Vua',
    grade: 'Lớp 6',
    period: 'Tự Chủ',
    image: '/assets/ngoquyen.png',
    blurb: 'Người mở ra thời kỳ độc lập lâu dài với chiến thắng Bạch Đằng.',
  },
  {
    id: 'khuc-thua-du',
    name: 'Khúc Thừa Dụ',
    type: 'Anh hùng',
    grade: 'Lớp 7',
    period: 'Tự Chủ',
    image: '/assets/khucthuadu.png',
    blurb: 'Người đặt nền móng tự chủ, mở đầu họ Khúc trong lịch sử dân tộc.',
  },
  {
    id: 'duong-dinh-nghe',
    name: 'Dương Đình Nghệ',
    type: 'Tướng lĩnh',
    grade: 'Lớp 7',
    period: 'Tự Chủ',
    image: '/assets/duongdinhnghe.png',
    blurb: 'Danh tướng đánh bại quân Nam Hán, củng cố quyền tự chủ trước thời Ngô Quyền.',
  },
  {
    id: 'ly-nam-de',
    name: 'Lý Nam Đế',
    type: 'Vua',
    grade: 'Lớp 7',
    period: 'Vạn Xuân',
    image: '/assets/lynamde.png',
    blurb: 'Người dựng nước Vạn Xuân, khẳng định khát vọng độc lập của dân tộc.',
  },
  {
    id: 'trieu-quang-phuc',
    name: 'Triệu Quang Phục',
    type: 'Tướng lĩnh',
    grade: 'Lớp 8',
    period: 'Vạn Xuân',
    image: '/assets/trieuquangphuc.png',
    blurb: 'Lãnh tụ kháng chiến bền bỉ tại đầm Dạ Trạch, tiếp nối sự nghiệp Vạn Xuân.',
  },
  {
    id: 'mai-thuc-loan',
    name: 'Mai Thúc Loan',
    type: 'Anh hùng',
    grade: 'Lớp 8',
    period: 'Bắc Thuộc',
    image: '/assets/MaiThúcLoan.jpg',
    blurb: 'Anh hùng khởi nghĩa Hoan Châu với tinh thần quật khởi chống áp bức.',
  },
  {
    id: 'phung-hung',
    name: 'Phùng Hưng',
    type: 'Anh hùng',
    grade: 'Lớp 9',
    period: 'Bắc Thuộc',
    image: '/assets/phunghung.png',
    blurb: 'Thủ lĩnh khởi nghĩa Đường Lâm, được nhân dân tôn xưng Bố Cái Đại Vương.',
  },
]

export const siteStats = [
  { label: 'Nhân vật', value: String(characters.length) },
  { label: 'Bài học', value: '24' },
  { label: 'Lượt học', value: '18.2K' },
]

const gradeCatalog = [
  { grade: 'Lớp 6', image: productImage, price: 150000, period: 'Âu Lạc - Tự Chủ' },
  { grade: 'Lớp 7', image: productImage, price: 319000, period: 'Vạn Xuân - Tự Chủ' },
  { grade: 'Lớp 8', image: productImage, price: 339000, period: 'Khởi nghĩa chống Bắc thuộc' },
  { grade: 'Lớp 9', image: productImage, price: 359000, period: 'Ôn tập lịch sử Việt Nam' },
]

const gradeSixComboImage = productImage

const gradeSixComboProducts: Product[] = [
  {
    id: 'combo-lop-6-3-bo',
    slug: 'combo-3-bo-the-bai-lop-6',
    name: 'Combo 3 bộ thẻ bài lịch sử lớp 6',
    subtitle: 'Tiết kiệm hơn khi mua 3 bộ thẻ lớp 6 cho nhóm học hoặc tặng bạn.',
    price: 429000,
    originalPrice: 450000,
    grade: 'Lớp 6',
    period: 'Tổng hợp',
    type: 'Anh hùng',
    stock: 36,
    image: gradeSixComboImage,
    description: 'Combo 3 bộ thẻ bài lịch sử lớp 6, phù hợp cho học nhóm, lớp học nhỏ hoặc mua chung cùng bạn bè.',
    features: [
      'Combo 3 bộ: Tiện chia nhóm học và cùng thi quiz.',
      'Quét QR — Chơi Quiz: Đấu trí hỏi đáp, ghi nhớ kiến thức cốt lõi.',
      'Ưu đãi mua chung: Tiết kiệm hơn so với mua lẻ từng bộ.',
    ],
    characterIds: characters.filter((character) => character.grade === 'Lớp 6').map((character) => character.id),
    arEnabled: true,
  },
  {
    id: 'combo-lop-6-5-bo',
    slug: 'combo-5-bo-the-bai-lop-6',
    name: 'Combo 5 bộ thẻ Nhân Vật Lịch sử lớp 6',
    subtitle: 'Combo 5 bộ dành cho lớp học, câu lạc bộ hoặc nhóm ôn tập lịch sử.',
    price: 719000,
    originalPrice: 750000,
    grade: 'Lớp 6',
    period: 'Tổng hợp',
    type: 'Anh hùng',
    stock: 36,
    image: gradeSixComboImage,
    description: 'Combo 5 bộ thẻ Nhân Vật Lịch sử lớp 6 giúp tổ chức hoạt động học nhóm, thi quiz và ôn tập trên lớp thuận tiện hơn.',
    features: [
      'Combo 5 bộ: Phù hợp cho lớp học và nhóm ôn tập.',
      'Dễ tổ chức trò chơi: Mỗi nhóm có bộ thẻ riêng để thi đấu.',
      'Ưu đãi số lượng: Tiết kiệm chi phí khi mua nhiều bộ.',
    ],
    characterIds: characters.filter((character) => character.grade === 'Lớp 6').map((character) => character.id),
    arEnabled: true,
  },
]

function buildCatalogProduct(entry: (typeof gradeCatalog)[number]): Product {
  const gradeCharacters = characters.filter((character) => character.grade === entry.grade)
  const isGradeSix = entry.grade === 'Lớp 6'

  return {
    id: `combo-${entry.grade.toLowerCase().replace('ớ', 'o').replace(/\s+/g, '-')}`,
    slug: `combo-the-bai-${entry.grade.toLowerCase().replace('ớ', 'o').replace(/\s+/g, '-')}`,
    name: isGradeSix ? 'Trọn bộ thẻ bài lịch sử Lớp 6' : `Trọn bộ thẻ bài lịch sử ${entry.grade}`,
    subtitle: isGradeSix
      ? 'Trải nghiệm trọn bộ 12 thẻ nhân vật lịch sử lớp 6 với bài học và Quiz tương tác.'
      : `${gradeCharacters.length} nhân vật - ${entry.period} - bài học và quiz`,
    price: entry.price,
    originalPrice: isGradeSix ? undefined : entry.price + 50000,
    grade: entry.grade,
    period: 'Tổng hợp',
    type: 'Anh hùng',
    stock: 36,
    image: productImage,
    description: isGradeSix
      ? 'Bộ thẻ được thiết kế cho học sinh lớp 6 với các nhân vật và mốc sử tiêu biểu từ giai đoạn Âu Lạc đến buổi đầu tự chủ. Hình minh hoạ rõ ràng, nội dung cô đọng và phần luyện tập đi kèm giúp các em dễ nhớ bài, ôn nhanh và hứng thú hơn khi học Lịch sử.'
      : `Bộ thẻ bài dành cho học sinh ${entry.grade}, kết hợp minh hoạ đẹp, nội dung lịch sử chọn lọc và phần luyện tập tương tác.`,
    features: isGradeSix
      ? [
          'Quét QR — Chơi Quiz: Đấu trí hỏi đáp, ghi nhớ kiến thức cốt lõi.',
          'Đọ chỉ số chiến thuật: Nhập vai nhân vật với hệ thống sức mạnh riêng.',
          'Mua sắm một chạm: Đặt hàng combo nhanh chóng, tiện lợi qua web.',
        ]
      : [`${gradeCharacters.length} thẻ nhân vật`, 'Kích hoạt bài học tương tác', 'Mở quiz và tích điểm', 'Tặng kèm poster dòng thời gian'],
    characterIds: gradeCharacters.map((character) => character.id),
    arEnabled: true,
  }
}

export const products: Product[] = [
  buildCatalogProduct(gradeCatalog[0]),
  
  // Duyệt qua danh sách combo lớp 6 để ép đường dẫn ảnh mới cho Combo 3 và Combo 5
  ...gradeSixComboProducts.map((product) => {
    if (product.id === 'combo-lop-6-3-bo') {
      return { ...product, image: '/assets/combo-the-bai-lop-6.png' }; // <-- Đường dẫn ảnh mới cho Combo 3
    }
    if (product.id === 'combo-lop-6-5-bo') {
      return { ...product, image: '/assets/combo-the-bai-lop-6.png' }; // <-- Đường dẫn ảnh mới cho Combo 5
    }
    return product;
  }),

  ...gradeCatalog.slice(1).map(buildCatalogProduct),
  ...characters.map((character, index) => ({
    id: character.id,
    slug: character.id,
    name: `Thẻ nhân vật ${character.name}`,
    subtitle: `${character.period} • ${character.grade}`,
    price: 39000 + index * 4000,
    grade: character.grade,
    period: character.period,
    type: character.type,
    stock: Math.max(8, 24 - index),
    image: productImage,
    description: character.blurb,
    features: ['Minh hoạ chất lượng cao', 'Ôn tập nhân vật theo chủ đề', 'Gợi ý bài học liên quan'],
    characterIds: [character.id],
    arEnabled: true,
  })),
]

export function getShowcaseProducts(catalog: Product[]) {
  const gradeSixProductIds = ['combo-lop-6', 'combo-lop-6-3-bo', 'combo-lop-6-5-bo']
  const gradeSixShowcase = gradeSixProductIds
    .map((productId) => catalog.find((product) => product.id === productId))
    .filter((product): product is Product => Boolean(product))

  if (gradeSixShowcase.length > 0) {
    return gradeSixShowcase
  }

  return catalog.filter((product) => product.characterIds.length > 1).slice(0, 3)
}

export const lessons: Lesson[] = [
  {
    id: 'hai-ba-trung-lesson',
    slug: 'hai-ba-trung-ngon-co-doc-lap',
    title: 'Hai Bà Trưng – Ngọn cờ đầu tiên của tinh thần độc lập',
    summary: 'Tìm hiểu bối cảnh đô hộ của nhà Đông Hán, nguyên nhân khởi nghĩa và ý nghĩa lịch sử của cuộc nổi dậy năm 40.',
    grade: 'Lớp 6',
    period: 'Trưng Vương',
    duration: '22 phút',
    image: '/assets/HBT.jpg',
    objectives: ['Hiểu nguyên nhân khởi nghĩa chống Đông Hán', 'Ghi nhớ diễn biến và kết quả cuộc khởi nghĩa', 'Rút ra bài học về đoàn kết và lòng yêu nước'],
    content: [
      'Hai Bà Trưng (Trưng Trắc và Trưng Nhị) là hai chị em, nữ anh hùng dân tộc sinh ra tại Mê Linh (Hà Nội ngày nay), dòng dõi Lạc tướng Hùng Vương.',
      'Vào đầu thế kỷ I, nước ta bị nhà Đông Hán đô hộ. Chính quyền đô hộ thi hành nhiều chính sách áp bức, bóc lột nhân dân, khiến cuộc sống của người dân vô cùng khổ cực. Đặc biệt, thái thú Tô Định nổi tiếng tàn bạo và đã sát hại Thi Sách, chồng của Trưng Trắc.',
      'Trước cảnh nước mất, dân khổ và để trả thù cho chồng, mùa xuân năm 40, Trưng Trắc cùng em gái là Trưng Nhị phất cờ khởi nghĩa tại Hát Môn. Cuộc khởi nghĩa nhanh chóng nhận được sự hưởng ứng của nhân dân khắp nơi. Chỉ trong thời gian ngắn, nghĩa quân đã giải phóng được nhiều vùng đất và đánh đuổi Tô Định về nước. Sau thắng lợi, Trưng Trắc lên ngôi vua, sử gọi là Trưng Vương, khôi phục nền tự chủ của dân tộc.',
      'Tuy nhiên, năm 42, nhà Đông Hán đưa quân sang xâm lược lần nữa. Sau nhiều trận chiến quyết liệt, cuộc kháng chiến thất bại vào năm 43.',
      'Dù không giữ được nền độc lập lâu dài, cuộc khởi nghĩa Hai Bà Trưng vẫn là mốc son chói lọi trong lịch sử dân tộc. Đây là cuộc đấu tranh lớn đầu tiên của người Việt chống lại ách đô hộ phương Bắc, thể hiện tinh thần yêu nước, ý chí độc lập và sức mạnh đoàn kết của nhân dân. Hình ảnh Hai Bà Trưng cưỡi voi ra trận đã trở thành biểu tượng bất diệt của lòng dũng cảm và khát vọng tự do.',
    ],
    historicalLesson: 'Khi đất nước lâm nguy, tinh thần đoàn kết và lòng yêu nước sẽ tạo nên sức mạnh to lớn để bảo vệ độc lập dân tộc.',
    inspirationMessage: 'Dù là nam hay nữ, mỗi người đều có thể trở thành anh hùng khi biết sống vì Tổ quốc.',
    relatedCharacterIds: ['hai-ba-trung'],
  },
  {
    id: 'trieu-thi-trinh-lesson',
    slug: 'trieu-thi-trinh-khat-vong-tu-do',
    title: 'Triệu Thị Trinh – Khát vọng tự do không bao giờ khuất phục',
    summary: 'Khám phá tinh thần bất khuất của Bà Triệu trong cuộc khởi nghĩa chống nhà Đông Ngô năm 248.',
    grade: 'Lớp 6',
    period: 'Bắc Thuộc',
    duration: '20 phút',
    image: '/assets/trieuthitrinh.jpg',
    objectives: ['Nhận biết bối cảnh áp bức của nhà Đông Ngô', 'Hiểu vai trò lãnh đạo của Triệu Thị Trinh', 'Liên hệ bài học về dũng cảm trước bất công'],
    content: [
      'Bà Triệu, tên thật là Triệu Thị Trinh, còn được gọi là Triệu Trinh Nương hay Nhụy Kiều Tướng Quân. Bà sinh ngày 2 tháng 10 năm 226 tại vùng núi Quan Yên, quận Cửu Chân, nay thuộc tỉnh Thanh Hóa.',
      'Vào thế kỷ III, nước ta tiếp tục chịu ách đô hộ của nhà Đông Ngô. Chính quyền đô hộ áp bức và bóc lột nhân dân nặng nề, khiến cuộc sống của người dân vô cùng khổ cực. Trong hoàn cảnh đó, Triệu Thị Trinh đã sớm nuôi dưỡng ý chí đánh đuổi quân xâm lược.',
      'Năm 248, bà cùng anh trai là Triệu Quốc Đạt tập hợp nghĩa quân, dựng cờ khởi nghĩa chống lại chính quyền đô hộ. Sau khi anh trai mất, Triệu Thị Trinh trở thành người lãnh đạo cuộc khởi nghĩa. Với lòng dũng cảm và tài chỉ huy, bà nhiều lần cùng nghĩa quân đánh bại quân Đông Ngô.',
      'Hình ảnh nữ tướng mặc áo giáp vàng, cưỡi voi ra trận đã khiến quân địch khiếp sợ và trở thành biểu tượng đẹp trong lịch sử dân tộc. Tuy nhiên, do lực lượng chênh lệch quá lớn, cuộc khởi nghĩa cuối cùng bị đàn áp và bà anh dũng hi sinh khi tuổi đời còn rất trẻ.',
      'Dù không giành được thắng lợi cuối cùng, cuộc khởi nghĩa của Triệu Thị Trinh đã tiếp nối truyền thống đấu tranh chống ngoại xâm của dân tộc Việt Nam. Tinh thần bất khuất, lòng yêu nước và khát vọng tự do của bà đã trở thành nguồn cảm hứng cho nhiều thế hệ người Việt sau này.',
    ],
    historicalLesson: 'Không khuất phục trước áp bức và bất công, mỗi người cần có lòng dũng cảm để bảo vệ những điều đúng đắn.',
    inspirationMessage: 'Tuổi trẻ không được đo bằng số năm sống, mà bằng khát vọng và những điều tốt đẹp dám cống hiến cho đất nước.',
    relatedCharacterIds: ['trieu-thi-trinh'],
  },
  {
    id: 'an-duong-vuong-lesson',
    slug: 'an-duong-vuong-xay-dung-au-lac',
    title: 'An Dương Vương – Người xây dựng nước Âu Lạc',
    summary: 'Tìm hiểu quá trình thống nhất Âu Việt, Lạc Việt, xây dựng Cổ Loa và bài học cảnh giác trong lịch sử.',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    duration: '20 phút',
    image: '/assets/An Dương Vương.jpg',
    objectives: ['Nắm được sự ra đời của nước Âu Lạc', 'Hiểu vai trò của thành Cổ Loa và nỏ Liên Châu', 'Rút ra bài học cảnh giác trước âm mưu xâm lược'],
    content: [
      'An Dương Vương, tên thật là Thục Phán, là vị vua duy nhất cai trị nhà nước Âu Lạc, được cho là sinh khoảng năm 257 trước Công nguyên tại vùng Ba Thục hoặc triều đình Thục cổ.',
      'Vào khoảng thế kỷ III trước Công nguyên, sau thời đại các vua Hùng, Thục Phán đã thống nhất các bộ tộc Âu Việt và Lạc Việt, thành lập nước Âu Lạc và lên ngôi vua, lấy hiệu là An Dương Vương.',
      'Để xây dựng đất nước vững mạnh, ông cho dời đô về Cổ Loa và xây dựng một tòa thành kiên cố với quy mô lớn chưa từng có lúc bấy giờ. Dưới sự lãnh đạo của An Dương Vương, nước Âu Lạc có tổ chức quân đội khá chặt chẽ và sở hữu nhiều vũ khí lợi hại, trong đó nổi tiếng nhất là nỏ Liên Châu.',
      'Nhờ đó, đất nước đã nhiều lần đánh bại các cuộc tấn công của Triệu Đà. Tuy nhiên, về sau do mất cảnh giác trước âm mưu của kẻ thù, bí mật quân sự bị lộ khiến Âu Lạc rơi vào tay Triệu Đà.',
      'Dù kết thúc triều đại trong hoàn cảnh đau xót, An Dương Vương vẫn được ghi nhận là người có công lớn trong việc xây dựng và bảo vệ nhà nước Âu Lạc, một trong những quốc gia đầu tiên của dân tộc Việt Nam.',
    ],
    historicalLesson: 'Muốn bảo vệ đất nước cần kết hợp giữa sức mạnh quân sự và sự cảnh giác trước mọi âm mưu xâm lược.',
    inspirationMessage: 'Sức mạnh giúp xây dựng thành công, nhưng sự tỉnh táo giúp bảo vệ thành quả ấy.',
    relatedCharacterIds: ['thuc-phan', 'cao-lo', 'my-chau'],
  },
  {
    id: 'cao-lo-lesson',
    slug: 'cao-lo-giu-bi-mat-quoc-gia',
    title: 'Cao Lỗ – Người giữ bí mật quốc gia',
    summary: 'Khám phá tài năng quân sự của Cao Lỗ và vai trò của ông trong việc bảo vệ thành Cổ Loa, nỏ Liên Châu.',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    duration: '18 phút',
    image: '/assets/Cao Lỗ.jpg',
    objectives: ['Nhận biết công lao chế tạo nỏ Liên Châu', 'Hiểu vai trò xây dựng thành Cổ Loa', 'Rút ra bài học lắng nghe góp ý đúng đắn'],
    content: [
      'Cao Lỗ, còn được gọi là Đô Lỗ, Cao Thông hay Thạch Thần, là một tướng tài và nhà sáng chế quân sự kiệt xuất thời Âu Lạc, sinh khoảng năm 277 trước Công nguyên.',
      'Cao Lỗ là vị tướng tài ba dưới triều An Dương Vương và được xem là người góp công lớn trong việc xây dựng thành Cổ Loa cũng như chế tạo nỏ Liên Châu nổi tiếng.',
      'Với tài năng quân sự và tầm nhìn xa, ông luôn chú trọng việc bảo vệ đất nước trước các mối đe dọa từ bên ngoài. Khi Triệu Đà dùng kế cho Trọng Thủy sang làm rể để tìm hiểu bí mật quân sự của Âu Lạc, Cao Lỗ đã nhiều lần khuyên vua phải đề cao cảnh giác.',
      'Tuy nhiên, những lời khuyên đó không được lắng nghe. Trước khi rời triều đình, ông đã để lại lời cảnh báo nổi tiếng rằng: “Giữ được nỏ thần thì giữ được nước”. Khi quân Triệu Đà tấn công, Cao Lỗ vẫn quay lại chiến đấu bảo vệ kinh thành và hy sinh vì đất nước.',
      'Hình ảnh Cao Lỗ thể hiện lòng trung thành, tinh thần trách nhiệm và ý thức bảo vệ lợi ích quốc gia lên trên lợi ích cá nhân.',
    ],
    historicalLesson: 'Người lãnh đạo cần biết lắng nghe những lời góp ý đúng đắn để tránh những sai lầm đáng tiếc.',
    inspirationMessage: 'Lòng trung thành với Tổ quốc luôn là phẩm chất cao quý của mỗi con người.',
    relatedCharacterIds: ['cao-lo'],
  },
  {
    id: 'my-chau-lesson',
    slug: 'my-chau-bai-hoc-canh-giac',
    title: 'Mỵ Châu – Bài học về sự cảnh giác',
    summary: 'Câu chuyện Mỵ Châu – Trọng Thủy và bài học trách nhiệm với vận mệnh quốc gia.',
    grade: 'Lớp 6',
    period: 'Âu Lạc',
    duration: '16 phút',
    image: '/assets/Mỵ Châu.jpg',
    objectives: ['Hiểu bi kịch Âu Lạc mất cảnh giác', 'Nhận biết vai trò bí mật nỏ thần', 'Rút ra bài học về lòng tin và trách nhiệm'],
    content: [
      'Mỵ Châu là công chúa triều đại Âu Lạc, con gái duy nhất của vua An Dương Vương. Bà lớn lên trong thời kỳ nước Âu Lạc đang phát triển hùng mạnh.',
      'Để tạo mối quan hệ hòa hiếu, bà kết hôn với Trọng Thủy, con trai của Triệu Đà. Tuy nhiên, cuộc hôn nhân này thực chất nằm trong âm mưu xâm lược của Triệu Đà.',
      'Vì quá tin tưởng chồng, Mỵ Châu đã vô tình để lộ bí mật về nỏ thần, loại vũ khí quan trọng bảo vệ đất nước. Sau khi có được thông tin cần thiết, Triệu Đà đem quân tấn công Âu Lạc.',
      'Khi nhận ra sự thật, mọi chuyện đã quá muộn và nước Âu Lạc rơi vào tay kẻ thù. Câu chuyện Mỵ Châu – Trọng Thủy là một truyền thuyết nổi tiếng trong lịch sử dân tộc, vừa thể hiện bi kịch của tình yêu vừa phản ánh bài học sâu sắc về trách nhiệm đối với đất nước.',
    ],
    historicalLesson: 'Lòng tin cần đi cùng sự tỉnh táo, đặc biệt trong những vấn đề liên quan đến vận mệnh quốc gia.',
    inspirationMessage: 'Yêu thương là điều đáng quý, nhưng trách nhiệm với đất nước luôn phải được đặt lên hàng đầu.',
    relatedCharacterIds: ['my-chau'],
  },
  {
    id: 'ly-bi-lesson',
    slug: 'ly-bi-van-xuan',
    title: 'Lý Bí – Người khai sinh nước Vạn Xuân',
    summary: 'Khám phá cuộc khởi nghĩa năm 542, sự ra đời của quốc hiệu Vạn Xuân và khát vọng độc lập lâu dài.',
    grade: 'Lớp 7',
    period: 'Vạn Xuân',
    duration: '21 phút',
    image: '/assets/Lý Bí.jpg',
    objectives: ['Nắm mốc khởi nghĩa năm 542', 'Hiểu ý nghĩa quốc hiệu Vạn Xuân', 'Rút ra bài học về ý chí và đoàn kết'],
    content: [
      'Lý Bí, tên gọi thường dùng là Lý Bôn hoặc Lý Nam Đế, sinh ngày 17 tháng 10 năm 503 tại thôn Cổ Pháp, hương Tế Xương, quận Giao Chỉ, nay thuộc tỉnh Thái Nguyên.',
      'Đầu thế kỷ VI, khi nước ta đang bị nhà Lương đô hộ, Lý Bí đã tập hợp lực lượng phát động cuộc khởi nghĩa vào năm 542. Nhờ sự ủng hộ của nhân dân, nghĩa quân nhanh chóng giành được nhiều thắng lợi lớn và làm chủ phần lớn đất đai ở Giao Châu.',
      'Năm 544, Lý Bí lên ngôi hoàng đế, lấy hiệu là Lý Nam Đế và đặt quốc hiệu là Vạn Xuân, thể hiện mong muốn đất nước mãi trường tồn. Ông xây dựng triều đình độc lập và từng bước củng cố nền tự chủ dân tộc.',
      'Mặc dù sau đó nhà Lương đem quân sang đàn áp, nhà nước Vạn Xuân vẫn tồn tại trong một thời gian và trở thành biểu tượng của ý chí độc lập của người Việt.',
      'Sự nghiệp của Lý Bí đánh dấu bước phát triển mới trong quá trình đấu tranh giành lại chủ quyền dân tộc sau nhiều thế kỷ Bắc thuộc.',
    ],
    historicalLesson: 'Muốn giành được độc lập phải có ý chí, lòng quyết tâm và sự đoàn kết của toàn dân.',
    inspirationMessage: 'Dám ước mơ về một tương lai tốt đẹp là bước đầu tiên để biến ước mơ thành hiện thực.',
    relatedCharacterIds: ['ly-nam-de'],
  },
  {
    id: 'trieu-quang-phuc-lesson',
    slug: 'trieu-quang-phuc-da-trach',
    title: 'Triệu Quang Phục – Vị tướng của đầm lầy Dạ Trạch',
    summary: 'Học cách Triệu Quang Phục tận dụng địa hình, kiên trì kháng chiến chống quân Lương.',
    grade: 'Lớp 8',
    period: 'Vạn Xuân',
    duration: '19 phút',
    image: '/assets/Triệu quang phục.jpg',
    objectives: ['Hiểu chiến thuật Dạ Trạch', 'Nhận biết vai trò của trí tuệ và kiên trì', 'Liên hệ bài học sáng tạo trong khó khăn'],
    content: [
      'Triệu Quang Phục, tên gọi thường dùng là Triệu Việt Vương, sinh khoảng thế kỷ VI tại vùng Chu Diên, nay thuộc Hưng Yên.',
      'Sau khi Lý Bí lập nên nước Vạn Xuân, nhà Lương tiếp tục đem quân sang xâm lược nhằm khôi phục ách đô hộ. Trong hoàn cảnh đất nước gặp nhiều khó khăn, Triệu Quang Phục được giao nhiệm vụ lãnh đạo cuộc kháng chiến chống quân xâm lược.',
      'Ông lựa chọn vùng đầm lầy Dạ Trạch làm căn cứ chiến đấu. Nhờ hiểu rõ địa hình và áp dụng chiến thuật linh hoạt, ban ngày nghĩa quân ẩn náu trong đầm lầy, ban đêm bất ngờ tập kích quân địch.',
      'Cách đánh sáng tạo này khiến quân Lương gặp nhiều tổn thất và không thể nhanh chóng giành thắng lợi. Sau nhiều năm kiên trì chiến đấu, nghĩa quân dần giành lại thế chủ động và bảo vệ được nền độc lập của nước Vạn Xuân. Sau đó, Triệu Quang Phục lên ngôi vua, lấy hiệu là Triệu Việt Vương.',
      'Triệu Quang Phục được lịch sử ghi nhận là một vị tướng tài giỏi, biết tận dụng địa hình và sức mạnh của nhân dân để chống lại kẻ thù mạnh hơn nhiều lần.',
    ],
    historicalLesson: 'Trong khó khăn, sự sáng tạo và tinh thần kiên trì có thể tạo nên sức mạnh giúp vượt qua thử thách.',
    inspirationMessage: 'Không phải lúc nào sức mạnh lớn hơn cũng chiến thắng, mà chính trí tuệ và lòng quyết tâm mới tạo nên kỳ tích.',
    relatedCharacterIds: ['trieu-quang-phuc'],
  },
  {
    id: 'mai-thuc-loan-lesson',
    slug: 'mai-thuc-loan-ngon-lua-dau-tranh',
    title: 'Mai Thúc Loan – Ngọn lửa đấu tranh thời Bắc thuộc',
    summary: 'Khám phá cuộc khởi nghĩa năm 722 và tinh thần quật cường của Mai Hắc Đế.',
    grade: 'Lớp 8',
    period: 'Bắc Thuộc',
    duration: '18 phút',
    image: '/assets/Mai Thúc Loan.jpg',
    objectives: ['Hiểu bối cảnh bóc lột thời Đường', 'Ghi nhớ khởi nghĩa Mai Thúc Loan', 'Rút ra sức mạnh đoàn kết của nhân dân'],
    content: [
      'Mai Thúc Loan, thường gọi là Mai Hắc Đế, sinh khoảng năm 670 tại làng Mai Phụ, Hà Tĩnh và lớn lên trong hoàn cảnh nghèo khó.',
      'Vào đầu thế kỷ VIII, nhân dân nước ta phải chịu nhiều chính sách bóc lột nặng nề của nhà Đường. Cuộc sống khổ cực đã thôi thúc Mai Thúc Loan đứng lên tập hợp nhân dân đấu tranh chống lại ách đô hộ.',
      'Năm 722, ông phát động cuộc khởi nghĩa lớn, thu hút hàng vạn người tham gia. Nghĩa quân nhanh chóng giành được nhiều thắng lợi và kiểm soát vùng đất rộng lớn. Sau đó, ông xưng đế, lấy hiệu là Mai Hắc Đế và xây dựng căn cứ tại thành Vạn An.',
      'Mặc dù cuộc khởi nghĩa cuối cùng bị nhà Đường đàn áp, phong trào đấu tranh của Mai Thúc Loan đã gây tiếng vang lớn và thể hiện tinh thần quật cường của dân tộc Việt Nam.',
      'Mai Thúc Loan là biểu tượng của ý chí không cam chịu trước áp bức và khát vọng giành lại độc lập cho đất nước.',
    ],
    historicalLesson: 'Khi nhân dân đoàn kết vì một mục tiêu chung, họ có thể tạo nên sức mạnh to lớn để thay đổi vận mệnh dân tộc.',
    inspirationMessage: 'Xuất thân không quyết định tương lai, ý chí và lòng quyết tâm mới làm nên giá trị của con người.',
    relatedCharacterIds: ['mai-thuc-loan'],
  },
  {
    id: 'phung-hung-lesson',
    slug: 'phung-hung-bo-cai-dai-vuong',
    title: 'Phùng Hưng – Người được nhân dân tôn là Bố Cái Đại Vương',
    summary: 'Tìm hiểu thủ lĩnh Đường Lâm được nhân dân tôn kính vì tài đánh giặc và lòng thương dân.',
    grade: 'Lớp 9',
    period: 'Bắc Thuộc',
    duration: '18 phút',
    image: '/assets/Phùng Hưng.jpg',
    objectives: ['Hiểu cuộc khởi nghĩa chống nhà Đường', 'Nhận biết ý nghĩa danh xưng Bố Cái Đại Vương', 'Rút ra bài học về lòng dân'],
    content: [
      'Phùng Hưng sinh ngày 25 tháng 11 năm 761 tại Đường Lâm, thuộc Phong Châu, nay thuộc xã Đường Lâm, thị xã Sơn Tây, Hà Nội.',
      'Cuối thế kỷ VIII, chính quyền nhà Đường ngày càng suy yếu nhưng vẫn tiếp tục áp bức nhân dân nước ta. Trước tình cảnh đó, Phùng Hưng cùng em trai là Phùng Hải đã tập hợp nghĩa sĩ đứng lên chống lại ách đô hộ.',
      'Cuộc khởi nghĩa do ông lãnh đạo nhanh chóng nhận được sự hưởng ứng rộng rãi. Nghĩa quân tiến công nhiều nơi và cuối cùng chiếm được thành Tống Bình, trung tâm cai trị của chính quyền đô hộ lúc bấy giờ.',
      'Sau khi giành quyền kiểm soát, Phùng Hưng chăm lo đời sống nhân dân và được mọi người hết lòng yêu mến. Khi ông qua đời, nhân dân tôn ông là “Bố Cái Đại Vương”, nghĩa là vị vua được kính trọng như cha mẹ của dân.',
      'Sự nghiệp của Phùng Hưng cho thấy sức mạnh của lòng dân trong cuộc đấu tranh chống áp bức và bảo vệ quyền lợi của cộng đồng.',
    ],
    historicalLesson: 'Muốn được nhân dân tin yêu, người lãnh đạo phải biết đặt lợi ích của đất nước và nhân dân lên hàng đầu.',
    inspirationMessage: 'Người lãnh đạo vĩ đại không chỉ giỏi chiến đấu mà còn biết yêu thương và chăm lo cho nhân dân.',
    relatedCharacterIds: ['phung-hung'],
  },
  {
    id: 'khuc-thua-du-lesson',
    slug: 'khuc-thua-du-tu-chu',
    title: 'Khúc Thừa Dụ – Người mở đầu thời kỳ tự chủ',
    summary: 'Nắm bắt thời cơ nhà Đường suy yếu để xây dựng chính quyền người Việt tự quản.',
    grade: 'Lớp 7',
    period: 'Tự Chủ',
    duration: '17 phút',
    image: '/assets/Khúc Thừa Dụ.jpg',
    objectives: ['Ghi nhớ mốc năm 905', 'Hiểu ý nghĩa chính quyền tự quản', 'Rút ra bài học nắm bắt thời cơ'],
    content: [
      'Khúc Thừa Dụ, thường gọi là Khúc Tiên Chủ, sinh khoảng giữa thế kỷ IX tại xã Cúc Bồ, huyện Ninh Giang, tỉnh Hải Dương ngày nay.',
      'Đầu thế kỷ X, khi nhà Đường ở Trung Quốc suy yếu, đất nước ta đứng trước cơ hội giành lại quyền tự chủ sau nhiều thế kỷ bị đô hộ. Nắm bắt thời cơ đó, Khúc Thừa Dụ đã tập hợp lực lượng và giành quyền kiểm soát vùng Tĩnh Hải quân.',
      'Năm 905, ông chiếm được thành Đại La và tự xưng là Tiết độ sứ. Dù vẫn mang danh nghĩa thuộc nhà Đường, trên thực tế ông đã xây dựng một chính quyền do người Việt tự quản lý.',
      'Đây là bước chuyển quan trọng trong lịch sử dân tộc, mở đầu cho quá trình khôi phục nền tự chủ lâu dài của đất nước. Sau khi ông qua đời, con trai là Khúc Hạo tiếp tục sự nghiệp và thực hiện nhiều cải cách quan trọng.',
      'Khúc Thừa Dụ được xem là người đặt nền móng cho sự phục hồi quyền làm chủ đất nước của dân tộc Việt Nam.',
    ],
    historicalLesson: 'Biết nắm bắt thời cơ đúng lúc có thể tạo nên những bước ngoặt lớn trong lịch sử.',
    inspirationMessage: 'Cơ hội luôn đến với những người có sự chuẩn bị và lòng quyết tâm hành động.',
    relatedCharacterIds: ['khuc-thua-du'],
  },
  {
    id: 'duong-dinh-nghe-lesson',
    slug: 'duong-dinh-nghe-giu-vung-tu-chu',
    title: 'Dương Đình Nghệ – Người giữ vững nền tự chủ',
    summary: 'Tìm hiểu vai trò của Dương Đình Nghệ trong việc bảo vệ thành quả tự chủ trước nguy cơ xâm lược.',
    grade: 'Lớp 7',
    period: 'Tự Chủ',
    duration: '18 phút',
    image: '/assets/Dương Đình Nghệ.jpg',
    objectives: ['Hiểu vai trò đánh bại Nam Hán năm 931', 'Nhận biết nguy cơ từ phản bội nội bộ', 'Rút ra bài học bảo vệ thành quả tự chủ'],
    content: [
      'Dương Đình Nghệ, tên gọi thường dùng là Dương Diên Nghệ, sinh khoảng năm 874 tại làng Giàng, huyện Đông Sơn, nay thuộc Thanh Hóa.',
      'Sau thời họ Khúc, đất nước đứng trước nguy cơ bị nhà Nam Hán xâm lược trở lại. Trong hoàn cảnh đó, Dương Đình Nghệ đã tập hợp lực lượng và xây dựng đội quân tinh nhuệ gồm khoảng ba nghìn nghĩa sĩ thân tín.',
      'Năm 931, khi quân Nam Hán chiếm thành Đại La, ông đem quân tiến ra Bắc và đánh bại quân xâm lược, giành lại quyền kiểm soát đất nước. Sau chiến thắng, Dương Đình Nghệ tiếp tục duy trì nền tự chủ và ổn định đời sống nhân dân.',
      'Ông cũng là người có ảnh hưởng lớn đối với thế hệ tướng lĩnh kế tiếp, đặc biệt là Ngô Quyền. Tuy nhiên, năm 937, ông bị Kiều Công Tiễn phản bội và sát hại, gây nên biến động lớn trong đất nước.',
      'Dương Đình Nghệ là một nhân vật quan trọng trong quá trình bảo vệ thành quả tự chủ và chuẩn bị tiền đề cho chiến thắng Bạch Đằng lịch sử sau này.',
    ],
    historicalLesson: 'Muốn bảo vệ thành quả đã đạt được, cần có sự đoàn kết và cảnh giác trước những nguy cơ từ bên trong lẫn bên ngoài.',
    inspirationMessage: 'Kiên trì gìn giữ những điều tốt đẹp cũng quan trọng như việc tạo dựng chúng.',
    relatedCharacterIds: ['duong-dinh-nghe'],
  },
  {
    id: 'ngo-quyen-lesson',
    slug: 'ngo-quyen-thoi-dai-doc-lap',
    title: 'Ngô Quyền – Người mở ra thời đại độc lập',
    summary: 'Khám phá chiến lược Bạch Đằng năm 938 và bước ngoặt chấm dứt hơn một nghìn năm Bắc thuộc.',
    grade: 'Lớp 6',
    period: 'Tự Chủ',
    duration: '18 phút',
    image: '/assets/Ngô Quyền.jpg',
    objectives: ['Hiểu diễn biến chính trận Bạch Đằng', 'Phân tích ý nghĩa lịch sử của chiến thắng', 'Rèn luyện tư duy so sánh chiến lược'],
    content: [
      'Ngô Quyền, tên gọi thường dùng là Tiền Ngô Vương, sinh ngày 12 tháng 3 năm 898 tại Đường Lâm, thuộc Phong Châu, nay thuộc Sơn Tây, Hà Nội.',
      'Ngô Quyền là vị anh hùng dân tộc có công chấm dứt hơn một nghìn năm Bắc thuộc và mở ra thời kỳ độc lập lâu dài của dân tộc Việt Nam. Năm 937, sau khi Dương Đình Nghệ bị Kiều Công Tiễn sát hại, Ngô Quyền đã đem quân tiêu diệt kẻ phản bội để ổn định tình hình đất nước.',
      'Khi Kiều Công Tiễn cầu cứu nhà Nam Hán, quân xâm lược tiến vào nước ta. Trước nguy cơ ấy, Ngô Quyền lựa chọn sông Bạch Đằng làm nơi quyết chiến. Ông cho đóng những cọc gỗ lớn xuống lòng sông và lợi dụng quy luật thủy triều để đánh bại quân địch.',
      'Năm 938, quân Nam Hán bị tiêu diệt hoàn toàn trong trận Bạch Đằng lịch sử. Sau chiến thắng, năm 939, Ngô Quyền lên ngôi vua, đóng đô ở Cổ Loa và xây dựng chính quyền độc lập.',
      'Chiến thắng Bạch Đằng không chỉ bảo vệ đất nước mà còn kết thúc hơn một nghìn năm bị các triều đại phương Bắc đô hộ, mở ra một thời kỳ phát triển mới cho dân tộc Việt Nam.',
    ],
    historicalLesson: 'Trí tuệ, lòng dũng cảm và tinh thần yêu nước có thể giúp dân tộc vượt qua những thử thách tưởng chừng không thể chiến thắng.',
    inspirationMessage: 'Người biết biến khó khăn thành cơ hội sẽ tạo nên những chiến thắng làm thay đổi lịch sử.',
    relatedCharacterIds: ['ngo-quyen'],
  },
]
