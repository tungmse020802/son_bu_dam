import { getShowcaseProducts, lessons as staticLessons, products as staticProducts } from '../src/data/mockData.js'
import type { Lesson, Product, ProductType } from '../src/types/app.js'
import {
  insertAdminLesson,
  insertAdminProduct,
  listAdminLessons,
  listAdminProducts,
  listLessonOverrides,
  listProductOverrides,
  updateAdminLesson,
  updateAdminProduct,
  upsertLessonOverride,
  upsertProductOverride,
} from './db.js'
import { randomUUID } from 'node:crypto'

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function splitLines(value: string) {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// Bài học: gộp bài học tĩnh (đã áp override nếu có) + bài học admin thêm mới.
export async function getAllLessons(): Promise<Lesson[]> {
  const [overrides, adminLessons] = await Promise.all([listLessonOverrides(), listAdminLessons()])
  const overrideMap = new Map(overrides.map((lesson) => [lesson.id, lesson]))
  const mergedStatic = staticLessons.map((lesson) => overrideMap.get(lesson.id) ?? lesson)
  return [...mergedStatic, ...adminLessons]
}

async function getMergedStaticProducts(): Promise<Product[]> {
  const overrides = await listProductOverrides()
  const overrideMap = new Map(overrides.map((product) => [product.id, product]))
  return staticProducts.map((product) => overrideMap.get(product.id) ?? product)
}

// Danh sách hiển thị ở trang Sản phẩm (6 sản phẩm nổi bật + sản phẩm admin thêm).
export async function getStorefrontCatalog(): Promise<Product[]> {
  const [mergedStatic, adminProducts] = await Promise.all([getMergedStaticProducts(), listAdminProducts()])
  return [...getShowcaseProducts(mergedStatic), ...adminProducts]
}

// Toàn bộ sản phẩm (kể cả không nổi bật) — dùng cho checkout và cho admin liệt kê để sửa.
export async function getFullProductCatalog(): Promise<Product[]> {
  const [mergedStatic, adminProducts] = await Promise.all([getMergedStaticProducts(), listAdminProducts()])
  return [...mergedStatic, ...adminProducts]
}

export type CreateLessonInput = {
  title: string
  summary: string
  grade: string
  period: string
  duration: string
  image: string
  objectives: string
  content: string
  historicalLesson?: string
  inspirationMessage?: string
  relatedCharacterIds: string[]
}

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  if (!input.title?.trim()) throw new Error('Vui lòng nhập tiêu đề bài học.')
  if (!input.summary?.trim()) throw new Error('Vui lòng nhập tóm tắt bài học.')
  if (!input.content?.trim()) throw new Error('Vui lòng nhập nội dung bài học.')

  const baseSlug = slugify(input.title) || `bai-hoc-${Date.now()}`
  const existing = await getAllLessons()
  let slug = baseSlug
  let suffix = 1
  while (existing.some((lesson) => lesson.slug === slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const lesson: Lesson = {
    id: randomUUID(),
    slug,
    title: input.title.trim(),
    summary: input.summary.trim(),
    grade: input.grade || 'Lớp 6',
    period: input.period ?? '',
    duration: input.duration || '15 phút',
    image: input.image?.trim() || '/assets/combo-the-bai-lop-6.png',
    objectives: splitLines(input.objectives),
    content: splitLines(input.content),
    historicalLesson: input.historicalLesson?.trim() || undefined,
    inspirationMessage: input.inspirationMessage?.trim() || undefined,
    relatedCharacterIds: input.relatedCharacterIds ?? [],
  }

  return insertAdminLesson(lesson)
}

export async function updateLesson(id: string, input: CreateLessonInput): Promise<Lesson> {
  const all = await getAllLessons()
  const existing = all.find((lesson) => lesson.id === id)
  if (!existing) throw new Error('Không tìm thấy bài học cần chỉnh sửa.')
  if (!input.title?.trim()) throw new Error('Vui lòng nhập tiêu đề bài học.')
  if (!input.summary?.trim()) throw new Error('Vui lòng nhập tóm tắt bài học.')
  if (!input.content?.trim()) throw new Error('Vui lòng nhập nội dung bài học.')

  // Giữ nguyên id & slug gốc để không phá vỡ đường link /lessons/:slug đã chia sẻ trước đó.
  const updated: Lesson = {
    ...existing,
    title: input.title.trim(),
    summary: input.summary.trim(),
    grade: input.grade || existing.grade,
    period: input.period ?? existing.period,
    duration: input.duration || existing.duration,
    image: input.image?.trim() || existing.image,
    objectives: splitLines(input.objectives),
    content: splitLines(input.content),
    historicalLesson: input.historicalLesson?.trim() || undefined,
    inspirationMessage: input.inspirationMessage?.trim() || undefined,
    relatedCharacterIds: input.relatedCharacterIds ?? existing.relatedCharacterIds,
  }

  const adminLessons = await listAdminLessons()
  const isAdminLesson = adminLessons.some((lesson) => lesson.id === id)

  if (isAdminLesson) {
    await updateAdminLesson(id, updated)
  } else {
    await upsertLessonOverride(updated)
  }

  return updated
}

export type CreateProductInput = {
  name: string
  subtitle: string
  price: number
  originalPrice?: number
  grade: string
  period: string
  type: ProductType
  stock: number
  image: string
  description: string
  features: string
  characterIds: string[]
  arEnabled: boolean
  comboTag?: boolean
  comingSoon: boolean
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  if (!input.name?.trim()) throw new Error('Vui lòng nhập tên sản phẩm.')
  if (!input.description?.trim()) throw new Error('Vui lòng nhập mô tả sản phẩm.')
  if (!input.comingSoon && (!Number.isFinite(Number(input.price)) || Number(input.price) < 0)) {
    throw new Error('Giá sản phẩm không hợp lệ.')
  }

  const baseSlug = slugify(input.name) || `san-pham-${Date.now()}`
  const existing = await getFullProductCatalog()
  let slug = baseSlug
  let suffix = 1
  while (existing.some((product) => product.slug === slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const product: Product = {
    id: randomUUID(),
    slug,
    name: input.name.trim(),
    subtitle: input.subtitle?.trim() ?? '',
    price: input.comingSoon ? 0 : Number(input.price),
    originalPrice: input.originalPrice && Number(input.originalPrice) > 0 ? Number(input.originalPrice) : undefined,
    grade: input.grade || 'Lớp 6',
    period: input.period ?? '',
    type: input.type,
    stock: input.comingSoon ? 0 : Math.max(0, Math.round(Number(input.stock) || 0)),
    image: input.image?.trim() || '/assets/combo-the-bai-lop-6.png',
    description: input.description.trim(),
    features: splitLines(input.features),
    characterIds: input.characterIds ?? [],
    arEnabled: Boolean(input.arEnabled),
    comboTag: input.comboTag,
    comingSoon: input.comingSoon || undefined,
  }

  return insertAdminProduct(product)
}

export async function updateProduct(id: string, input: CreateProductInput): Promise<Product> {
  const all = await getFullProductCatalog()
  const existing = all.find((product) => product.id === id)
  if (!existing) throw new Error('Không tìm thấy sản phẩm cần chỉnh sửa.')
  if (!input.name?.trim()) throw new Error('Vui lòng nhập tên sản phẩm.')
  if (!input.description?.trim()) throw new Error('Vui lòng nhập mô tả sản phẩm.')
  if (!input.comingSoon && (!Number.isFinite(Number(input.price)) || Number(input.price) < 0)) {
    throw new Error('Giá sản phẩm không hợp lệ.')
  }

  const updated: Product = {
    ...existing,
    name: input.name.trim(),
    subtitle: input.subtitle?.trim() ?? existing.subtitle,
    price: input.comingSoon ? 0 : Number(input.price),
    originalPrice: input.originalPrice && Number(input.originalPrice) > 0 ? Number(input.originalPrice) : undefined,
    grade: input.grade || existing.grade,
    period: input.period ?? existing.period,
    type: input.type,
    stock: input.comingSoon ? 0 : Math.max(0, Math.round(Number(input.stock) || 0)),
    image: input.image?.trim() || existing.image,
    description: input.description.trim(),
    features: splitLines(input.features),
    characterIds: input.characterIds ?? existing.characterIds,
    arEnabled: Boolean(input.arEnabled),
    comboTag: input.comboTag,
    comingSoon: input.comingSoon || undefined,
  }

  const adminProducts = await listAdminProducts()
  const isAdminProduct = adminProducts.some((product) => product.id === id)

  if (isAdminProduct) {
    await updateAdminProduct(id, updated)
  } else {
    await upsertProductOverride(updated)
  }

  return updated
}