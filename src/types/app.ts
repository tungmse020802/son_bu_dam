export type ProductType = 'Vua' | 'Tướng lĩnh' | 'Anh hùng' | 'Công chúa'
export type PaymentMethod = 'cod' | 'bank' | 'momo'
export type OrderStatus = 'pending' | 'payment_link_created' | 'paid' | 'cancelled' | 'failed' | 'expired' | 'processing' | 'completed'
export type UserRole = 'customer' | 'admin'

export interface Character {
  id: string
  name: string
  type: ProductType
  grade: string
  period: string
  image: string
  blurb: string
}

export interface Product {
  id: string
  slug: string
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
  features: string[]
  characterIds: string[]
  arEnabled: boolean
}

export interface Lesson {
  id: string
  slug: string
  title: string
  summary: string
  grade: string
  period: string
  duration: string
  image: string
  objectives: string[]
  content: string[]
  lesson?: string
  historicalLesson?: string
  inspirationMessage?: string
  relatedCharacterIds: string[]
}

export interface QuizQuestion {
  id: string
  level: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface QuizSet {
  slug: string
  title: string
  description: string
  questionCount: number
  questions: QuizQuestion[]
}

export interface ArExperience {
  markerId: string
  characterId: string
  title: string
  description: string
  rewardPoints: number
  questions: QuizQuestion[]
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: string
  userId?: string | null
  orderCode: number
  customerName: string
  email: string
  address: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  subtotal: number
  shipping: number
  total: number
  createdAt: string
  checkoutUrl?: string | null
  paymentLinkId?: string | null
  qrCode?: string | null
}

export interface OrderDetail extends Order {
  items: OrderItem[]
}

export interface CheckoutRequest {
  customerName: string
  email: string
  address: string
  paymentMethod: PaymentMethod
  cart: CartItem[]
}

export interface CheckoutResponse {
  orderCode: number
  status: OrderStatus
  checkoutUrl: string | null
  message: string
  paymentMethod: PaymentMethod
  order?: OrderDetail
}

export interface DashboardMetric {
  label: string
  value: string
  change: string
}

export interface DashboardData {
  metrics: DashboardMetric[]
  orders: Order[]
}

export interface AdminUserSummary extends AuthUser {
  createdAt: string
  orderCount: number
  totalSpent: number
}

export interface AdminOverviewData extends DashboardData {
  userCount: number
  orderCount: number
}

export interface QuizApiResponse {
  quiz: QuizSet
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  user: AuthUser
  message?: string
}

export interface AuthErrorResponse {
  message: string
}
