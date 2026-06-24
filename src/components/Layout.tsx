import { Award, BookOpen, Boxes, LogIn, LogOut, ShoppingCart, Sparkles, UserCircle2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface HeaderProps {
  cartCount: number
  learnerName?: string
  isAdmin?: boolean
  onLogout: () => void
}

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Sparkles },
  { to: '/products', label: 'Sản phẩm', icon: Boxes },
  { to: '/lessons', label: 'Bài học', icon: BookOpen },
  { to: '/quiz', label: 'Quiz', icon: Award },
]

export function Header({ cartCount, learnerName, isAdmin, onLogout }: HeaderProps) {
  return (
    <header className="site-header site-header-compact">
      <div className="header-glow" />
      <div className="container nav-shell">
        <div className="brand-mark">
          <img src="/assets/logo.png" alt="Sử Việt Anh Minh" />
          <div>
            <h1>Sử Việt Anh Minh</h1>
          </div>
        </div>

        <nav className="main-nav main-nav-refined">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="header-actions">
          {learnerName ? (
            <div className="account-action-group" aria-label="Tài khoản đang đăng nhập">
              <NavLink to="/account" className="account-pill">
                <UserCircle2 size={16} />
                <span>{learnerName}</span>
              </NavLink>
              {isAdmin ? (
                <NavLink to="/dashboard" className="account-pill">
                  Admin
                </NavLink>
              ) : null}
              <button type="button" className="icon-action" onClick={onLogout} aria-label="Đăng xuất">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <NavLink to="/account" className="ghost-btn login-cta">
              <LogIn size={16} />
              Đăng nhập
            </NavLink>
          )}
          <NavLink to="/checkout" className="cart-pill">
            <ShoppingCart size={16} />
            Giỏ hàng <span>{cartCount}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer site-footer-premium">
      <div className="container footer-shell">
        <div className="footer-intro">
          <p className="footer-kicker">Nền tảng học lịch sử kết hợp bài học, quiz và thương mại</p>
          <h3>Sử Việt Anh Minh</h3>
          <p className="footer-summary">
            Bộ thẻ bài giáo dục giải trí tiên phong giúp học sinh THCS dễ dàng tiếp cận và ghi nhớ kiến thức.
            Chúng tôi biến những trang sử khô khan thành những trải nghiệm tương tác thú vị, khơi dậy lòng tự
            hào và tình yêu lịch sử dân tộc cho thế hệ trẻ.
          </p>
        </div>

        <div className="footer-links">
          <h4>Khám phá</h4>
          <ul>
            <li>Danh mục sản phẩm</li>
            <li>Bài học theo thời kỳ</li>
            <li>Quiz game lịch sử</li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <ul>
            <li>Hotline: (+84) 9xx xxx xxx</li>
            <li>Email: suvietanhminh@gmail.com</li>
            <li>Địa chỉ: Trường Đại học FPT Hà Nội, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
