import { Award, BookOpen, Boxes, LogIn, LogOut, ShoppingCart, Sparkles, UserCircle2 } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'

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
  // Hàm xử lý cuộn lên đầu trang một cách mượt mà khi người dùng click vào link
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            <li>
              <Link to="/products" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>
                Danh mục sản phẩm
              </Link>
            </li>
            <li>
              <Link to="/lessons" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>
                Bài học theo thời kỳ
              </Link>
            </li>
            <li>
              <Link to="/quiz" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>
                Quiz game lịch sử
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <ul>
            <li className="footer-contact-item">
              {/* Icon Điện thoại / Hotline */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Hotline: (+84) 973 491 866</span>
            </li>
            
            <li className="footer-contact-item">
              <a 
                href="https://www.facebook.com/profile.php?id=61590118002475" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-fb-link"
              >
                {/* Icon Facebook */}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                <span>Fanpage: Sử Việt Anh Minh</span>
              </a>
            </li>
            
            <li className="footer-contact-item">
              {/* Icon Thư / Email */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Email: suvietanhminh@gmail.com</span>
            </li>
            
            <li className="footer-contact-item alignment-top">
              {/* Icon Định vị / Địa chỉ */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Địa chỉ: Trường Đại học FPT Hà Nội, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}