import {
  Boxes,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import type { AdminOverviewData, AdminUserSummary, AuthUser, Order, OrderDetail } from '../types/app'
import { API_BASE_URL } from '../utils/api'
import { formatCurrency, orderStatusLabel, paymentLabel } from '../utils/store'
import { DashboardOverview } from './DashboardOverview'

interface AdminDashboardProps {
  currentUser: AuthUser | null
  authLoading: boolean
  onLogout: () => void | Promise<void>
}

async function fetchAdmin<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message ?? 'Không tải được dữ liệu quản trị.')
  }
  return data as T
}

function AdminOverviewPage({ data }: { data: AdminOverviewData | null }) {
  const metrics = data
    ? [
        ...data.metrics.slice(0, 3),
        { label: 'Tài khoản', value: String(data.userCount), change: 'Đã đăng ký trong hệ thống' },
      ]
    : []

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow dark">Tổng quan vận hành</p>
          <h2>Dashboard quản trị</h2>
          <p>Theo dõi tài khoản, doanh thu và trạng thái xử lý đơn hàng.</p>
        </div>
        <div className="admin-heading-badge">
          <ShieldCheck size={18} />
          Dữ liệu hệ thống
        </div>
      </div>

      <DashboardOverview metrics={metrics} orders={data?.orders ?? []} />

      <div className="admin-quick-grid">
        <Link to="/dashboard/accounts" className="admin-quick-card">
          <Users size={22} />
          <div>
            <strong>Quản lý tài khoản</strong>
            <span>{data?.userCount ?? 0} tài khoản đang có</span>
          </div>
          <ChevronRight size={18} />
        </Link>
        <Link to="/dashboard/orders" className="admin-quick-card">
          <ShoppingBag size={22} />
          <div>
            <strong>Quản lý đơn hàng</strong>
            <span>{data?.orderCount ?? 0} đơn hàng toàn hệ thống</span>
          </div>
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  )
}

function AdminAccountsPage({ users }: { users: AdminUserSummary[] }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          !normalizedQuery ||
          user.fullName.toLowerCase().includes(normalizedQuery) ||
          user.email.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery, users],
  )

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow dark">Người dùng</p>
          <h2>Quản lý tài khoản</h2>
          <p>Tra cứu vai trò, ngày đăng ký và lịch sử mua hàng của người dùng.</p>
        </div>
        <span className="admin-count-chip">{filteredUsers.length} tài khoản</span>
      </div>

      <label className="admin-search">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
        />
      </label>

      <div className="admin-data-card">
        <div className="admin-table admin-users-table">
          <div className="admin-table-row admin-table-head">
            <span>Tài khoản</span>
            <span>Vai trò</span>
            <span>Ngày tạo</span>
            <span>Đơn hàng</span>
            <span>Đã thanh toán</span>
          </div>
          {filteredUsers.map((user) => (
            <div key={user.id} className="admin-table-row">
              <div className="admin-user-cell">
                <span className="admin-avatar">{user.fullName.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{user.fullName}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              <span className={`admin-role ${user.role}`}>{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
              <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
              <strong>{user.orderCount}</strong>
              <strong>{formatCurrency(user.totalSpent)}</strong>
            </div>
          ))}
          {!filteredUsers.length ? <p className="admin-empty">Không tìm thấy tài khoản phù hợp.</p> : null}
        </div>
      </div>
    </div>
  )
}

function AdminOrdersPage({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (status === 'all' || order.status === status) &&
          (!normalizedQuery ||
            String(order.orderCode).includes(normalizedQuery) ||
            order.customerName.toLowerCase().includes(normalizedQuery) ||
            order.email.toLowerCase().includes(normalizedQuery)),
      ),
    [normalizedQuery, orders, status],
  )

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow dark">Thương mại</p>
          <h2>Quản lý đơn hàng</h2>
          <p>Tìm kiếm, lọc trạng thái và mở hồ sơ chi tiết của từng đơn.</p>
        </div>
        <span className="admin-count-chip">{filteredOrders.length} đơn hàng</span>
      </div>

      <div className="admin-filter-bar">
        <label className="admin-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Mã đơn, khách hàng hoặc email..."
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ tạo link</option>
          <option value="payment_link_created">Chờ thanh toán</option>
          <option value="processing">Đang xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>

      <div className="admin-data-card">
        <div className="admin-table admin-orders-table">
          <div className="admin-table-row admin-table-head">
            <span>Mã đơn</span>
            <span>Khách hàng</span>
            <span>Thanh toán</span>
            <span>Trạng thái</span>
            <span>Tổng tiền</span>
            <span />
          </div>
          {filteredOrders.map((order) => (
            <div key={order.id} className="admin-table-row">
              <div>
                <strong>DH-{order.orderCode}</strong>
                <small>{order.createdAt}</small>
              </div>
              <div>
                <strong>{order.customerName}</strong>
                <small>{order.email}</small>
              </div>
              <span>{paymentLabel(order.paymentMethod)}</span>
              <span className={`status-pill ${order.status}`}>{orderStatusLabel(order.status)}</span>
              <strong>{formatCurrency(order.total)}</strong>
              <Link className="admin-row-link" to={`/dashboard/orders/${order.orderCode}`}>
                Chi tiết <ChevronRight size={15} />
              </Link>
            </div>
          ))}
          {!filteredOrders.length ? <p className="admin-empty">Không có đơn hàng phù hợp.</p> : null}
        </div>
      </div>
    </div>
  )
}

function AdminOrderDetailPage() {
  const { orderCode } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdmin<OrderDetail>(`/api/admin/orders/${orderCode}`)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Không tải được chi tiết đơn hàng.')
      })
    return () => {
      cancelled = true
    }
  }, [orderCode])

  if (message) return <p className="status-message error">{message}</p>
  if (!order) return <p className="status-message info">Đang tải chi tiết đơn hàng...</p>

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <Link to="/dashboard/orders" className="admin-back-link">← Danh sách đơn hàng</Link>
          <h2>Đơn hàng DH-{order.orderCode}</h2>
          <p>Tạo lúc {order.createdAt}</p>
        </div>
        <span className={`status-pill ${order.status}`}>{orderStatusLabel(order.status)}</span>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-data-card admin-detail-card">
          <h3>Sản phẩm trong đơn</h3>
          <div className="admin-line-items">
            {order.items.map((item) => (
              <div key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="admin-totals">
            <div><span>Tạm tính</span><strong>{formatCurrency(order.subtotal)}</strong></div>
            <div><span>Phí vận chuyển</span><strong>{formatCurrency(order.shipping)}</strong></div>
            <div className="grand-total"><span>Tổng cộng</span><strong>{formatCurrency(order.total)}</strong></div>
          </div>
        </section>

        <aside className="admin-detail-side">
          <section className="admin-data-card admin-detail-card">
            <h3>Khách hàng</h3>
            <dl>
              <div><dt>Họ tên</dt><dd>{order.customerName}</dd></div>
              <div><dt>Email</dt><dd>{order.email}</dd></div>
              <div><dt>Địa chỉ</dt><dd>{order.address}</dd></div>
            </dl>
          </section>
          <section className="admin-data-card admin-detail-card">
            <h3>Thanh toán</h3>
            <dl>
              <div><dt>Phương thức</dt><dd>{paymentLabel(order.paymentMethod)}</dd></div>
              <div><dt>Trạng thái</dt><dd>{orderStatusLabel(order.status)}</dd></div>
              {order.paymentLinkId ? <div><dt>Mã giao dịch</dt><dd>{order.paymentLinkId}</dd></div> : null}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

export function AdminDashboard({ currentUser, authLoading, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminOverviewData | null>(null)
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading || currentUser?.role !== 'admin') return
    let cancelled = false

    Promise.all([
      fetchAdmin<AdminOverviewData>('/api/admin/overview'),
      fetchAdmin<{ users: AdminUserSummary[] }>('/api/admin/users'),
      fetchAdmin<{ orders: Order[] }>('/api/admin/orders'),
    ])
      .then(([overviewData, usersData, ordersData]) => {
        if (cancelled) return
        setOverview(overviewData)
        setUsers(usersData.users)
        setOrders(ordersData.orders)
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Không tải được dữ liệu quản trị.')
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, currentUser])

  async function handleLogout() {
    await onLogout()
    navigate('/account', { replace: true })
  }

  if (authLoading) {
    return <p className="status-message info admin-route-message">Đang kiểm tra quyền quản trị...</p>
  }
  if (!currentUser) return <Navigate to="/account" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/account" replace />

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/dashboard" className="admin-brand">
          <img src="/assets/logo.png" alt="Sử Việt Anh Minh" />
          <div>
            <strong>SVAM Admin</strong>
            <span>Trung tâm vận hành</span>
          </div>
        </Link>
        <nav>
          <NavLink to="/dashboard" end><LayoutDashboard size={18} />Tổng quan</NavLink>
          <NavLink to="/dashboard/accounts"><Users size={18} />Tài khoản</NavLink>
          <NavLink to="/dashboard/orders"><ClipboardList size={18} />Đơn hàng</NavLink>
          <Link to="/products"><Boxes size={18} />Xem cửa hàng</Link>
        </nav>
        <div className="admin-sidebar-user">
          <span className="admin-avatar">{currentUser.fullName.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{currentUser.fullName}</strong>
            <small>{currentUser.email}</small>
          </div>
          <button type="button" onClick={handleLogout} aria-label="Đăng xuất admin"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <strong>Khu vực quản trị</strong>
            <span>Quản lý dữ liệu bán hàng và người dùng</span>
          </div>
          <span className="admin-live-indicator"><ShoppingBag size={16} /> {orders.length} đơn hàng</span>
        </header>
        <div className="admin-content">
          {message ? <p className="status-message error">{message}</p> : null}
          <Routes>
            <Route index element={<AdminOverviewPage data={overview} />} />
            <Route path="accounts" element={<AdminAccountsPage users={users} />} />
            <Route path="orders" element={<AdminOrdersPage orders={orders} />} />
            <Route path="orders/:orderCode" element={<AdminOrderDetailPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
