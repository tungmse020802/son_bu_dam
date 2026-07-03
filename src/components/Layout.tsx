import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom'
import { 
  Award, BookOpen, Boxes, LogIn, LogOut, ShoppingCart, Sparkles, 
  UserCircle2, Search, User, ChevronDown, Phone, Mail, MapPin, Compass, ShieldCheck,
  Volume2, VolumeX, Menu, X
} from 'lucide-react'
import { BackgroundMusic } from './BackgroundMusic'

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

const HERO_LESSONS_MAP = [
  { keywords: ['nguyen hue', 'quang trung', 'nguyễn huệ'], url: '/lessons/quang-trung-nguyen-hue' },
  { keywords: ['trieu thi trinh', 'Triệu Thị Trinh', 'triệu thị trinh'], url: '/lessons/trieu-thi-trinh-khat-vong-tu-do' },
  { keywords: ['hai ba trung', 'trung trac', 'trung nhi', 'hai bà trưng'], url: '/lessons/hai-ba-trung-ngon-co-doc-lap' },
  { keywords: ['thuc phan', 'thục phán', 'an duong vuong', 'an dương vương'], url: '/lessons/an-duong-vuong-xay-dung-au-lac' },
  { keywords: ['ngo quyen', 'ngô quyền'], url: '/lessons/ngo-quyen-thoi-dai-doc-lap' },
  { keywords: ['cao lo', 'cao lỗ', 'do lo', 'đô lỗ', 'cao thong', 'cao thông', 'thach than', 'thạch thần'], url: '/lessons/cao-lo-giu-bi-mat-quoc-gia' },
  { keywords: ['my chau', 'mỵ châu'], url: '/lessons/my-chau-bai-hoc-canh-giac' },
  { keywords: ['ly bi', 'lý bí', 'ly bon', 'lý bôn', 'ly nam de','lý nam đế'], url: '/lessons/ly-bi-van-xuan' },
  { keywords: ['trieu quang phuc', 'triệu quang phục','trieu viet vuong', 'triệu việt vương'], url: '/lessons/trieu-quang-phuc-da-trach' },
  { keywords: ['mai thuc loan', 'mai thúc loan','mai hac de', 'mai hắc đế'], url: '/lessons/mai-thuc-loan-ngon-lua-dau-tranh' },
  { keywords: ['phung hung', 'phùng hưng'], url: '/lessons/phung-hung-bo-cai-dai-vuong' },
  { keywords: ['khuc thua du', 'khúc thừa dụ','khuc tien chu', 'khúc tiên chủ'], url: '/lessons/khuc-thua-du-tu-chu' },
  { keywords: ['duong dinh nghe', 'dương đình nghệ','duong dien nghe', 'dương diên nghệ'], url: '/lessons/duong-dinh-nghe-giu-vung-tu-chu' },
]

export function Header({ cartCount, learnerName, isAdmin, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Tự đóng menu mobile mỗi khi người dùng chuyển sang trang khác
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return
    const cleanQuery = searchQuery.toLowerCase().trim()

    const matchedLesson = HERO_LESSONS_MAP.find((hero) =>
      hero.keywords.some((keyword) => cleanQuery.includes(keyword) || keyword.includes(cleanQuery))
    )

    if (matchedLesson) {
      navigate(matchedLesson.url)
    } else {
      navigate(`/lessons?search=${encodeURIComponent(searchQuery)}`)
    }
    setSearchQuery('')
    setIsMobileMenuOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <header className="site-header site-header-compact">
      <div className="header-glow" />
      <div className="container nav-shell">
        <div className="brand-mark">
          <Link to="/" className="logo-container" aria-label="Trang chủ">
            <img src="/assets/Logo Button SVAM.png" alt="Sử Việt Anh Minh" />
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`header-collapsible ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="main-nav main-nav-refined">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="header-actions">
            <div className="search-box">
              <button type="button" onClick={handleSearchSubmit} aria-label="Tìm kiếm">
                <Search size={15} />
              </button>
              <input 
                type="text" 
                placeholder="Tìm tên anh hùng..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {learnerName ? (
              <>
                <NavLink id="cart-icon" to="/checkout" className="shopee-cart-wrapper" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart size={22} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="shopee-cart-badge">{cartCount}</span>
                  )}
                </NavLink>

                <div className="profile-dropdown-container" ref={dropdownRef}>
                  <button 
                    type="button" 
                    className={`account-pill dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserCircle2 size={16} />
                    <span>{learnerName}</span>
                    <ChevronDown size={14} className={`arrow-icon ${isDropdownOpen ? 'rotate' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="profile-dropdown-menu">
                      <Link
                        to="/account"
                        className="dropdown-item"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <User size={15} />
                        <span>Thông tin tài khoản</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/dashboard"
                          className="dropdown-item admin-item"
                          onClick={() => {
                            setIsDropdownOpen(false)
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <Sparkles size={15} />
                          <span>Trang Admin</span>
                        </Link>
                      )}

                      <button 
                        type="button" 
                        className="dropdown-item logout-item" 
                        onClick={() => {
                          setIsDropdownOpen(false)
                          setIsMobileMenuOpen(false)
                          onLogout()
                        }}
                      >
                        <LogOut size={15} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="account-action-group">
                <NavLink id="cart-icon" to="/checkout" className="shopee-cart-wrapper" style={{ marginRight: '4px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart size={22} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="shopee-cart-badge">{cartCount}</span>
                  )}
                </NavLink>
                
                <NavLink to="/account" className="ghost-btn login-cta" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn size={16} />
                  Đăng nhập
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="svam-footer-pro">
      <div className="svam-footer-pro-inner">
        <div className="svam-footer-pro-grid">
          {/* Cột 1: Thương hiệu - title giữ nguyên vị trí, chỉ nằm ở hàng 1 */}
          <h3 className="svam-footer-pro-title svam-footer-pro-cell-title">Sử Việt Anh Minh</h3>
          <p className="svam-footer-pro-rowline svam-footer-pro-cell-tagline">
            NỀN TẢNG HỌC LỊCH SỬ KẾT HỢP BÀI HỌC, QUIZ VÀ THƯƠNG MẠI
          </p>
          <p className="svam-footer-pro-desc svam-footer-pro-cell-desc">
            Bộ thẻ bài giáo dục giải trí tiên phong giúp học sinh THCS dễ dàng tiếp cận và ghi nhớ kiến thức.
            Chúng tôi biến những trang sử khô khan thành những trải nghiệm tương tác thú vị, khơi dậy lòng tự hào
            và tình yêu lịch sử dân tộc cho thế hệ trẻ.
          </p>

          {/* Cột 2: Khám phá - không có gì ở hàng 1, heading bắt đầu ở hàng 2 */}
          <h4 className="svam-footer-pro-rowline svam-footer-pro-cell-explore-heading">Khám phá</h4>
          <ul className="svam-footer-pro-list svam-footer-pro-cell-explore-list">
            <li><Link to="/products">Danh mục sản phẩm</Link></li>
            <li><Link to="/lessons">Bài học theo thời kỳ</Link></li>
            <li><Link to="/quiz">Quiz game lịch sử</Link></li>
          </ul>

          {/* Cột 3: Liên hệ - cũng bắt đầu ở hàng 2, thẳng hàng với Khám phá và tagline */}
          <h4 className="svam-footer-pro-rowline svam-footer-pro-cell-contact-heading">Liên hệ</h4>
          <ul className="svam-footer-pro-list svam-footer-pro-cell-contact-list">
            <li className="svam-footer-pro-contact-item">
              <Phone size={16} className="svam-footer-pro-icon" />
              <a href="tel:+84973491866">Hotline: (+84) 973 491 866</a>
            </li>
            <li className="svam-footer-pro-contact-item">
              <svg className="svam-footer-pro-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <a href="https://www.facebook.com/profile.php?id=61590118002475#" target="_blank" rel="noreferrer">
                Fanpage: Sử Việt Anh Minh
              </a>
            </li>
            <li className="svam-footer-pro-contact-item">
              <Mail size={16} className="svam-footer-pro-icon" />
              <a href="mailto:suvietanhminh@gmail.com">suvietanhminh@gmail.com</a>
            </li>
            <li className="svam-footer-pro-contact-item svam-footer-pro-contact-item-multiline">
              <MapPin size={16} className="svam-footer-pro-icon" />
              <span>Trường Đại học FPT Hà Nội, Khu Công nghệ cao Hòa Lạc, Hà Nội, Việt Nam</span>
            </li>
          </ul>
        </div>

        <div className="svam-footer-pro-bottom">
          <span>© {currentYear} Sử Việt Anh Minh.</span>
          <span className="svam-footer-pro-bottom-note">Made with pride for Vietnamese history</span>
        </div>
      </div>

      <BackgroundMusic />
    </footer>
  )
}