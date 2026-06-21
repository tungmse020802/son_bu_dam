import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { lessons } from '../src/data/mockData.js'
import type { CheckoutRequest } from '../src/types/app.js'
import { clearAuthSession, createUser, getAuthUserFromRequest, loginUser, setUserAuthSession } from './auth.js'
import { initializeDatabase, listStoredUsers } from './db.js'
import { createOrder, getCatalogProducts, getDashboardData, getOrderByCode, listAllOrders, listOrdersByUser, updateOrderStatus } from './orders.js'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const frontendDistDir = path.resolve(process.cwd(), 'dist')
const frontendIndexPath = path.join(frontendDistDir, 'index.html')

const allowedOrigins = [
  process.env.APP_BASE_URL,
  process.env.API_BASE_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `https://${process.env.CODESPACE_NAME}-5173.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : undefined,
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `https://${process.env.CODESPACE_NAME}-8787.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : undefined,
].filter((value): value is string => Boolean(value))

function isAllowedOrigin(origin?: string) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true

  try {
    const { hostname, protocol } = new URL(origin)
    if (protocol !== 'http:' && protocol !== 'https:') return false
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true
    if (hostname.endsWith('.vercel.app')) return true
    return false
  } catch {
    return false
  }
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }),
)
app.use(cookieParser())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

async function handleRegister(req: express.Request, res: express.Response) {
  try {
    const user = await createUser(req.body as { fullName: string; email: string; password: string })
    setUserAuthSession(res, user)
    res.status(201).json({ user, message: 'Tạo tài khoản thành công.' })
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Không thể tạo tài khoản.' })
  }
}

async function handleLogin(req: express.Request, res: express.Response) {
  try {
    const user = await loginUser(req.body as { email: string; password: string })
    setUserAuthSession(res, user)
    res.json({ user, message: 'Đăng nhập thành công.' })
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : 'Đăng nhập thất bại.' })
  }
}

async function handleMe(req: express.Request, res: express.Response) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      res.status(401).json({ message: 'Chưa đăng nhập.' })
      return
    }
    res.json({ user })
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : 'Không xác thực được người dùng.' })
  }
}

function handleLogout(_req: express.Request, res: express.Response) {
  clearAuthSession(res)
  res.json({ message: 'Đăng xuất thành công.' })
}

async function handleAccountOrders(req: express.Request, res: express.Response) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      res.status(401).json({ message: 'Chưa đăng nhập.' })
      return
    }
    const orders = await listOrdersByUser(user.id)
    res.json({ orders })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Không tải được đơn hàng của tài khoản.' })
  }
}

app.post('/api/auth/register', handleRegister)
app.post('/api/auth-register', handleRegister)
app.post('/api/auth/login', handleLogin)
app.post('/api/auth-login', handleLogin)
app.get('/api/auth/me', handleMe)
app.get('/api/auth-me', handleMe)
app.post('/api/auth/logout', handleLogout)
app.post('/api/auth-logout', handleLogout)
app.get('/api/account/orders', handleAccountOrders)
app.get('/api/account-orders', handleAccountOrders)

app.get('/api/products', (_req, res) => {
  res.json(getCatalogProducts())
})

app.get('/api/lessons', (_req, res) => {
  res.json(lessons)
})

app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập tài khoản admin để xem dashboard.' })
      return
    }
    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Bạn không có quyền xem dashboard admin.' })
      return
    }
    const dashboard = await getDashboardData()
    res.json(dashboard)
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Không tải được dashboard.' })
  }
})

async function requireAdmin(req: express.Request, res: express.Response) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    res.status(401).json({ message: 'Vui lòng đăng nhập tài khoản admin.' })
    return null
  }
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Bạn không có quyền truy cập khu vực quản trị.' })
    return null
  }
  return user
}

app.get('/api/admin/overview', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return
    const [dashboard, users, orders] = await Promise.all([
      getDashboardData(),
      listStoredUsers(),
      listAllOrders(),
    ])
    res.json({ ...dashboard, userCount: users.length, orderCount: orders.length })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Không tải được tổng quan quản trị.' })
  }
})

app.get('/api/admin/users', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return
    const [users, orders] = await Promise.all([listStoredUsers(), listAllOrders()])
    res.json({
      users: users.map((user) => {
        const userOrders = orders.filter(
          (order) => order.userId === user.id || order.email.toLowerCase() === user.email.toLowerCase(),
        )
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          orderCount: userOrders.length,
          totalSpent: userOrders
            .filter((order) => order.status === 'paid' || order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0),
        }
      }),
    })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Không tải được danh sách tài khoản.' })
  }
})

app.get('/api/admin/orders', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return
    res.json({ orders: await listAllOrders() })
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Không tải được danh sách đơn hàng.' })
  }
})

app.get('/api/admin/orders/:orderCode', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return
    res.json(await getOrderByCode(getOrderCodeFromRequest(req)))
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : 'Không tìm thấy đơn hàng.' })
  }
})

app.post('/api/admin/orders/:orderCode/confirm-payment', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const orderCode = getOrderCodeFromRequest(req)
    const currentOrder = await getOrderByCode(orderCode)
    if (currentOrder.status === 'paid' || currentOrder.status === 'completed') {
      res.status(400).json({ message: 'Đơn hàng này đã được xác nhận thanh toán.' })
      return
    }

    const order = await updateOrderStatus(orderCode, 'paid', 'admin.payment_confirmed', {
      confirmedBy: admin.email,
      confirmedAt: new Date().toISOString(),
      source: 'dashboard',
    })

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Không thể xác nhận thanh toán.' })
  }
})

app.post('/api/checkout', async (req, res) => {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập trước khi mua hàng.' })
      return
    }
    const order = await createOrder(req.body as CheckoutRequest, user.id)

    res.json({
      orderCode: order.orderCode,
      status: order.status,
      checkoutUrl: order.checkoutUrl ?? null,
      paymentMethod: order.paymentMethod,
      order,
      message: 'Đơn chuyển khoản đã được tạo. Vui lòng quét QR VietQR để thanh toán.',
    })
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Checkout thất bại.' })
  }
})

function getOrderCodeFromRequest(req: express.Request) {
  const value = req.params.orderCode ?? req.query.orderCode
  const raw = Array.isArray(value) ? value[0] : value
  return Number(raw)
}

async function handleOrderDetail(req: express.Request, res: express.Response) {
  try {
    const order = await getOrderByCode(getOrderCodeFromRequest(req))
    res.json(order)
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : 'Không tìm thấy đơn hàng.' })
  }
}

app.get('/api/orders/:orderCode', handleOrderDetail)
app.get('/api/order', handleOrderDetail)

function sendFrontendIndex(res: express.Response) {
  if (existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath)
    return
  }

  res
    .status(200)
    .type('html')
    .send(
      `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sử Việt Anh Minh</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f8f4ea; color: #4a231d; }
      .card { max-width: 720px; margin: 0 auto; background: white; border: 1px solid #e7dcc6; border-radius: 20px; padding: 28px; box-shadow: 0 12px 30px rgba(0,0,0,.08); }
      h1 { margin-top: 0; }
      a { color: #9c3b2e; }
      code { background: #f3ede1; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Sử Việt Anh Minh</h1>
      <p>API server đang chạy trên <code>http://127.0.0.1:${port}</code> nhưng chưa tìm thấy bản frontend đã build trong <code>dist/</code>.</p>
      <p>Hãy chạy <code>npm run build</code> rồi tải lại trang, hoặc mở frontend dev server ở <code>http://127.0.0.1:80/</code>.</p>
    </main>
  </body>
</html>`,
    )
}

app.use(express.static(frontendDistDir))

app.get('/', (_req, res) => {
  sendFrontendIndex(res)
})

app.get(/^(?!\/api\/).*/, (_req, res) => {
  sendFrontendIndex(res)
})

export async function startServer() {
  await initializeDatabase()
  app.listen(port, '127.0.0.1', () => {
    console.log(`API listening on http://localhost:${port}`)
  })
}

if (process.env.VERCEL !== '1') {
  startServer().catch((error) => {
    console.error('Failed to initialize database', error)
    process.exit(1)
  })
}

export { app }
