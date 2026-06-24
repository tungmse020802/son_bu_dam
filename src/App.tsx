import { ArrowRight, Award, CheckCircle2, Sparkles, UsersRound } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminDashboard } from './components/AdminDashboard'
import { DashboardOverview } from './components/DashboardOverview'
import { Footer, Header } from './components/Layout'
import { LessonCard } from './components/LessonCard'
import { ProductCard } from './components/ProductCard'
import { getShowcaseProducts, lessons, products as fallbackProducts } from './data/mockData'
import { historyQuiz, historyQuizSets } from './data/quizData'
import type { AuthUser, CartItem, CheckoutResponse, DashboardData, OrderDetail, PaymentMethod } from './types/app'
import { API_BASE_URL, getApiMessage, readApiJson } from './utils/api'
import { getCurrentUser, loginUser, logoutUser, registerUser } from './utils/auth'
import {
  addToCart,
  calculateSubtotal,
  formatCurrency,
  getStoredOrder,
  loadCart,
  loadStoredOrders,
  orderStatusLabel,
  paymentLabel,
  saveCart,
  saveStoredOrder,
  syncCartWithCatalog,
  updateQuantity,
} from './utils/store'



function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function HomePage({ featuredProduct }: { featuredProduct: (typeof fallbackProducts)[number] | null }) {
  return (
    <section className="home-hero">
      <div className="home-hero-orb home-hero-orb-one" />
      <div className="home-hero-orb home-hero-orb-two" />
      <div className="container home-hero-shell">
        <div className="home-hero-copy">
          <div className="home-hero-kicker">
            <span><Sparkles size={14} /></span>
            Nền tảng học lịch sử Việt Nam cho THCS
          </div>
          <h2 className="home-hero-title">
            <span>Học Sử chủ động</span>
            <em>Trải nghiệm sống động</em>
          </h2>
          <p className="home-hero-description">
            Cùng Sử Việt Anh Minh biến mỗi bài học thành hành trình khám phá qua thẻ bài sưu tầm và thử thách quiz tương tác
          </p>
          <div className="home-hero-actions">
            <Link to="/quiz" className="home-hero-primary">
              Bắt đầu quiz <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="home-hero-secondary">Xem bộ sưu tập</Link>
          </div>
        </div>

        <aside className="home-featured-card" aria-label="Bộ thẻ nổi bật">
          {featuredProduct ? (
            <>
              <div className="home-featured-visual">
                <img src={featuredProduct.image} alt={featuredProduct.name} />
                <span className="home-featured-label">Bộ sưu tập nổi bật</span>
                <span className="home-featured-grade">Lớp 6</span>
              </div>
              <div className="home-featured-content">
                <p>Combo · Quiz</p>
                <h3>{featuredProduct.name}</h3>
                <span>12 nhân vật lịch sử - Âu Lạc - Tự Chủ - trải nghiệm AR &amp; quiz</span>
                <Link to="/products" className="home-featured-link">
                  Khám phá bộ sưu tập <ArrowRight size={17} />
                </Link>
              </div>
            </>
          ) : (
            <div className="home-featured-empty">
              <Sparkles size={26} />
              <h3>Bộ sưu tập đang cập nhật</h3>
              <p>Những hành trình lịch sử mới đang được chuẩn bị.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function ProductsPage({
  products,
  loading,
  onAdd,
}: {
  products: (typeof fallbackProducts)
  loading: boolean
  onAdd: (productId: string) => void
}) {
  const showcaseProducts = getShowcaseProducts(products)

  return (
    <section className="container section-block catalog-layout catalog-layout-stacked">
      {loading ? <div className="catalog-state-card">Đang tải catalog từ backend...</div> : null}
      {!loading && showcaseProducts.length === 0 ? <div className="catalog-state-card">Hiện chưa có sản phẩm để hiển thị.</div> : null}
      <div className="product-grid product-grid-refined product-grid-showcase">
        {showcaseProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  )
}

function LessonsPage() {
  return (
    <section className="container section-block lessons-page">
      <div className="section-heading section-heading-balanced">
        <div>
          <p className="eyebrow dark">Learning module</p>
          <h3>Học lịch sử theo bài học gắn với nhân vật</h3>
        </div>
        <Link to="/quiz" className="secondary-btn">Mở đấu trường quiz</Link>
      </div>
      <div className="lesson-grid lesson-grid-refined">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </section>
  )
}

function LessonDetailPage() {
  const { slug } = useParams()
  const lesson = lessons.find((entry) => entry.slug === slug)

  if (!lesson) {
    return (
      <section className="container section-block">
        <div className="admin-panel lesson-detail-panel">
          <Link to="/lessons" className="admin-back-link">← Quay lại bài học</Link>
          <h2>Không tìm thấy bài học</h2>
          <p>Bài học bạn chọn không còn tồn tại hoặc đường dẫn chưa đúng.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container section-block lesson-detail-shell">
      <Link to="/lessons" className="admin-back-link">← Quay lại danh sách bài học</Link>
      <article className="admin-panel lesson-detail-panel lesson-detail-panel-premium">
        <img src={lesson.image} alt={lesson.title} className="lesson-detail-image" />
        <div className="lesson-meta lesson-detail-meta">
          <span>{lesson.grade}</span>
          <span>{lesson.period}</span>
          <span>{lesson.duration}</span>
        </div>
        <h2>{lesson.title}</h2>
        <p className="lesson-detail-summary">{lesson.summary}</p>
        <div className="lesson-reading-body">
          {lesson.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {lesson.historicalLesson ? (
          <div className="lesson-callout lesson-callout-history">
            <strong>Bài học lịch sử</strong>
            <p>{lesson.historicalLesson}</p>
          </div>
        ) : null}
        {lesson.inspirationMessage ? (
          <div className="lesson-callout lesson-callout-inspire">
            <strong>Thông điệp truyền cảm hứng</strong>
            <p>{lesson.inspirationMessage}</p>
          </div>
        ) : null}
      </article>
    </section>
  )
}

function QuizPage({ currentUser }: { currentUser: AuthUser | null }) {
  const [selectedQuizSlug, setSelectedQuizSlug] = useState(historyQuizSets[0].slug)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [unlockedOrders, setUnlockedOrders] = useState<OrderDetail[]>([])
  const [unlockLoading, setUnlockLoading] = useState(false)

  const selectedQuiz = historyQuizSets.find((quiz) => quiz.slug === selectedQuizSlug) ?? historyQuizSets[0]
  const question = selectedQuiz.questions[currentIndex] ?? selectedQuiz.questions[0]
  const progress = selectedQuiz.questionCount > 0
    ? ((currentIndex + (showResult ? 1 : 0)) / selectedQuiz.questionCount) * 100
    : 0
  const answeredCount = Object.keys(answers).length
  const unlockedProducts = Array.from(
    new Set(
      unlockedOrders.flatMap((order) =>
        (order.items ?? []).length
          ? order.items.map((item) => item.productName)
          : [`Đơn DH-${order.orderCode}`],
      ),
    ),
  )
  const hasCardModeAccess = unlockedOrders.length > 0

  useEffect(() => {
    if (!currentUser) {
      setUnlockedOrders([])
      return
    }

    let cancelled = false
    const activeUser = currentUser

    async function loadUnlockedOrders() {
      setUnlockLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/account-orders`, {
          credentials: 'include',
        })
        const data = await readApiJson<{ orders?: OrderDetail[]; message?: string }>(response)
        if (!response.ok) {
          throw new Error(getApiMessage(data) ?? 'Không tải được quyền mở khóa thẻ bài.')
        }

        const orders = (data?.orders ?? []).filter(
          (order) => Boolean(order.cardModeUnlockedAt) || order.status === 'paid' || order.status === 'completed',
        )
        if (!cancelled) {
          setUnlockedOrders(orders)
        }
      } catch {
        if (!cancelled) {
          const localOrders = loadStoredOrders().filter(
            (order) =>
              (order.userId === activeUser.id ||
                order.email.trim().toLowerCase() === activeUser.email.trim().toLowerCase()) &&
              (Boolean(order.cardModeUnlockedAt) || order.status === 'paid' || order.status === 'completed'),
          )
          setUnlockedOrders(localOrders)
        }
      } finally {
        if (!cancelled) {
          setUnlockLoading(false)
        }
      }
    }

    loadUnlockedOrders()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  function resetCurrentQuestion() {
    setSelectedOption(null)
    setSubmitted(false)
  }

  function handleSubmit() {
    if (selectedOption === null || submitted) return
    const isCorrect = selectedOption === question.correctIndex
    const wasAnsweredCorrectly = answers[question.id]
    setAnswers((prev) => ({ ...prev, [question.id]: isCorrect }))
    if (isCorrect && !wasAnsweredCorrectly) {
      setScore((prev) => prev + 1)
    }
    if (!isCorrect && wasAnsweredCorrectly) {
      setScore((prev) => Math.max(0, prev - 1))
    }
    setSubmitted(true)
  }

  function handleNext() {
    if (currentIndex === selectedQuiz.questions.length - 1) {
      setShowResult(true)
      return
    }
    setCurrentIndex((prev) => prev + 1)
    resetCurrentQuestion()
  }

  function handlePrevious() {
    if (currentIndex === 0) return
    setCurrentIndex((prev) => prev - 1)
    resetCurrentQuestion()
  }

  function handleSelectQuestion(index: number) {
    setCurrentIndex(index)
    setShowResult(false)
    resetCurrentQuestion()
  }

  function handleRestart() {
    setCurrentIndex(0)
    setSelectedOption(null)
    setSubmitted(false)
    setScore(0)
    setShowResult(false)
    setAnswers({})
  }

  function handleSelectQuiz(slug: string) {
    setSelectedQuizSlug(slug)
    setCurrentIndex(0)
    setSelectedOption(null)
    setSubmitted(false)
    setScore(0)
    setShowResult(false)
    setAnswers({})
  }

  return (
    <section className="container section-block quiz-shell quiz-shell-refined">
      <div className="quiz-hero-card quiz-hero-card-clean">
        <div>
          <p className="eyebrow">Quiz game</p>
          <h2>{historyQuiz.title}</h2>
          <p>{historyQuiz.description}</p>
        </div>
        <div className="quiz-badges quiz-badges-clean">
          <span>Cần đăng nhập</span>
          <span>Mua thẻ bài</span>
          <span>3 bộ quiz</span>
          <span>Có chấm điểm</span>
        </div>
      </div>

      {!currentUser ? (
        <div className="admin-panel quiz-access-panel quiz-access-panel-clean">
          <div>
            <p className="eyebrow dark">Bước 1</p>
            <h3>Đăng nhập để làm quiz</h3>
            <p>Hãy đăng nhập tài khoản học viên để hệ thống ghi nhận tiến trình và điểm số trước khi bắt đầu thử thách.</p>
          </div>
          <Link to="/account" className="primary-btn">Đăng nhập ngay</Link>
        </div>
      ) : unlockLoading ? (
        <div className="admin-panel quiz-access-panel quiz-access-panel-clean">
          <div>
            <p className="eyebrow dark">Đang kiểm tra</p>
            <h3>Đang tải quyền thẻ bài</h3>
            <p>Hệ thống đang đối chiếu các đơn đã được xác nhận thanh toán để mở khóa chế độ thẻ bài.</p>
          </div>
        </div>
      ) : !hasCardModeAccess ? (
        <div className="admin-panel quiz-access-panel quiz-access-panel-clean">
          <div>
            <p className="eyebrow dark">Bước 2</p>
            <h3>Chưa mở khóa thẻ bài</h3>
            <p>Bạn cần mua bộ thẻ bài và hoàn tất chuyển khoản để hệ thống mở khóa chế độ thẻ bài cho tài khoản.</p>
          </div>
          <div className="hero-actions hero-actions-compact">
            <Link to="/products" className="primary-btn">Mua bộ thẻ ngay</Link>
            <Link to="/account" className="secondary-btn">Xem đơn hàng của tôi</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-panel quiz-access-panel quiz-access-panel-clean">
            <div>
              <p className="eyebrow dark">Đã mở khóa</p>
              <h3>Chế độ thẻ bài đã sẵn sàng</h3>
              <p>{unlockedProducts.join(', ')}</p>
            </div>
          </div>
          <div className="quiz-set-grid" aria-label="Chọn bộ quiz theo cấp độ">
            {historyQuizSets.map((quiz) => (
              <button
                key={quiz.slug}
                type="button"
                className={`quiz-set-card ${quiz.slug === selectedQuiz.slug ? 'active' : ''}`}
                onClick={() => handleSelectQuiz(quiz.slug)}
              >
                <span>{quiz.questions[0]?.level}</span>
                <strong>{quiz.title}</strong>
                <small>{quiz.questionCount} câu hỏi</small>
              </button>
            ))}
          </div>

          {showResult ? (
            <div className="quiz-result-panel admin-panel quiz-result-panel-clean">
              <div className="result-ring result-ring-clean">
                <strong>{score}/{selectedQuiz.questionCount}</strong>
                <span>Điểm tổng kết</span>
              </div>
              <div>
                <p className="eyebrow dark">{selectedQuiz.title}</p>
                <h3>Hoàn thành bộ quiz</h3>
                <p>
                  Bạn đã trả lời đúng {score} / {selectedQuiz.questionCount} câu trong bộ {selectedQuiz.questions[0]?.level}. Hãy luyện lại, xem bài học liên quan hoặc mua bộ thẻ phù hợp.
                </p>
                <div className="hero-actions hero-actions-compact">
                  <button className="primary-btn" onClick={handleRestart}>Chơi lại từ đầu</button>
                  <Link to="/products" className="secondary-btn">Mua bộ thẻ nổi bật</Link>
                  <Link to="/lessons" className="ghost-btn light">Xem bài học</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="quiz-layout quiz-layout-clean">
              <div className="admin-panel quiz-main-panel quiz-main-panel-clean">
                <div className="quiz-progress-row">
                  <div>
                    <span className="eyebrow dark">{question.level}</span>
                    <h3>Câu {currentIndex + 1}</h3>
                  </div>
                  <strong>{Math.round(progress)}%</strong>
                </div>
                <div className="quiz-progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <h4 className="quiz-prompt">{question.prompt}</h4>
                <div className="quiz-options-grid quiz-options-grid-clean">
                  {question.options.map((option, index) => {
                    const isCorrect = submitted && index === question.correctIndex
                    const isWrong = submitted && selectedOption === index && index !== question.correctIndex
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`quiz-option ${selectedOption === index ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                        onClick={() => !submitted && setSelectedOption(index)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <strong>{option}</strong>
                      </button>
                    )
                  })}
                </div>
                {submitted ? (
                  <div className="quiz-feedback-box quiz-feedback-box-clean">
                    <div className="quiz-feedback-title">
                      <CheckCircle2 size={18} />
                      <strong>{selectedOption === question.correctIndex ? 'Chính xác!' : 'Chưa đúng, thử ghi nhớ lại nhé.'}</strong>
                    </div>
                    <p>{question.explanation}</p>
                  </div>
                ) : null}
                <div className="hero-actions hero-actions-compact quiz-actions-row">
                  <button className="secondary-btn" onClick={handlePrevious} disabled={currentIndex === 0}>
                    Câu trước
                  </button>
                  {!submitted ? (
                    <button className="primary-btn" onClick={handleSubmit} disabled={selectedOption === null}>
                      Khóa đáp án
                    </button>
                  ) : (
                    <button className="primary-btn" onClick={handleNext}>
                      {currentIndex === selectedQuiz.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                    </button>
                  )}
                  <button className="secondary-btn" onClick={handleNext}>
                    {currentIndex === selectedQuiz.questions.length - 1 ? 'Xem kết quả' : 'Next'}
                  </button>
                </div>
              </div>

              <aside className="admin-panel quiz-side-panel quiz-side-panel-clean">
                <p className="eyebrow dark">Tiến trình</p>
                <h3>{selectedQuiz.title}</h3>
                <p>{selectedQuiz.description}</p>
                <div className="quiz-side-stats quiz-side-stats-clean">
                  <div><strong>{answeredCount}</strong><span>Đã làm</span></div>
                  <div><strong>{score}</strong><span>Điểm</span></div>
                  <div><strong>{selectedQuiz.questionCount - answeredCount}</strong><span>Còn lại</span></div>
                </div>
                <div className="quiz-check-grid quiz-check-grid-clean">
                  {selectedQuiz.questions.map((item, index) => {
                    const isAnswered = Object.prototype.hasOwnProperty.call(answers, item.id)
                    const isCorrect = answers[item.id]
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`quiz-checkpoint ${index === currentIndex ? 'active' : ''} ${isAnswered ? 'answered' : ''} ${isCorrect ? 'done' : ''}`}
                        onClick={() => handleSelectQuestion(index)}
                        aria-label={`Chọn câu hỏi ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                <p className="quiz-side-note">Sau mỗi câu, bạn sẽ nhận được giải thích để củng cố kiến thức trước khi chuyển sang phần học hoặc mua combo liên quan.</p>
              </aside>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CheckoutPage({
  cart,
  products,
  catalogLoading,
  currentUser,
  setCart,
}: {
  cart: CartItem[]
  products: (typeof fallbackProducts)
  catalogLoading: boolean
  currentUser: AuthUser | null
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
}) {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState(currentUser?.fullName ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [qrOrder, setQrOrder] = useState<OrderDetail | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setCustomerName((prev) => prev || currentUser.fullName)
    setEmail((prev) => prev || currentUser.email)
  }, [currentUser])

  const subtotal = calculateSubtotal(cart, products)
  const shipping = subtotal > 0 ? 30000 : 0
  const total = subtotal + shipping
  const paymentHint = 'Hệ thống sẽ tạo mã VietQR TPBank theo đúng số tiền đơn hàng. Sau khi tạo đơn, bạn chỉ cần quét QR để chuyển khoản.'

  async function handleCheckout() {
    if (!currentUser) {
      setMessage('Vui lòng đăng nhập trước khi mua hàng.')
      navigate('/account')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, email, address, paymentMethod: 'bank' satisfies PaymentMethod, cart }),
      })
      const data = await readApiJson<CheckoutResponse & { message?: string }>(response)
      if (!response.ok) {
        setMessage(getApiMessage(data) ?? 'Checkout thất bại.')
        return
      }
      if (!data) {
        setMessage('Phản hồi từ máy chủ không hợp lệ.')
        return
      }

      if (data.order) {
        saveStoredOrder(data.order)
      }

      if (data.paymentMethod === 'bank') {
        navigate(`/checkout/success?orderCode=${data.orderCode}`)
        return
      }
      setMessage('Phương thức thanh toán không còn được hỗ trợ.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentUser) {
    return (
      <section className="container section-block checkout-layout single-column result-shell">
        <div className="admin-panel result-card-premium result-card-clean">
          <p className="eyebrow">Cần đăng nhập</p>
          <h3>Đăng nhập trước khi mua hàng</h3>
          <p>Luồng thanh toán VietQR và mở khóa thẻ bài chỉ áp dụng cho tài khoản đã đăng nhập để hệ thống gắn đơn hàng đúng người học.</p>
          <div className="hero-actions hero-actions-compact">
            <Link to="/account" className="primary-btn">Đăng nhập ngay</Link>
            <Link to="/products" className="secondary-btn">Quay lại sản phẩm</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container section-block checkout-layout checkout-layout-premium refined-layout-two-column">
      <div className="admin-panel checkout-card-premium checkout-card-primary">
        <div className="section-heading section-heading-balanced">
          <div>
            <p className="eyebrow">Checkout</p>
            <h3>Giỏ hàng & thanh toán</h3>
          </div>
        </div>
        {catalogLoading ? <p className="status-message info">Đang đồng bộ tồn kho mới nhất từ backend...</p> : null}
        <div className="cart-list">
          {cart.length === 0 ? (
            <p>Giỏ hàng đang trống.</p>
          ) : (
            cart.map((item) => {
              const product = products.find((entry) => entry.id === item.productId)
              if (!product) return null
              const isAtStockLimit = item.quantity >= product.stock
              return (
                <div key={item.productId} className="cart-row cart-row-refined">
                  <div>
                    <strong>{product.name}</strong>
                    <p>{formatCurrency(product.price)}</p>
                    <span className={`stock-inline ${product.stock <= 0 ? 'soldout' : product.stock <= 3 ? 'low' : 'ready'}`}>
                      {product.stock <= 0 ? 'Tạm hết hàng' : product.stock <= 3 ? `Chỉ còn ${product.stock}` : `Còn ${product.stock}`}
                    </span>
                  </div>
                  <div className="qty-controls qty-controls-refined">
                    <button onClick={() => setCart((prev) => updateQuantity(prev, item.productId, item.quantity - 1, product.stock))}>-</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => setCart((prev) => updateQuantity(prev, item.productId, item.quantity + 1, product.stock))}
                      disabled={isAtStockLimit}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <div className="admin-panel checkout-card-premium checkout-card-secondary checkout-card-sticky">
        <p className="eyebrow">Thông tin nhận hàng</p>
        {currentUser ? <p className="status-message info compact">Đã tự điền thông tin từ tài khoản của bạn.</p> : null}
        <div className="form-grid">
          <label>
            Họ tên
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nguyễn Văn A" />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Địa chỉ
            <textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
          </label>
          <label>
            Phương thức thanh toán
            <input value="VietQR / TPBank" readOnly />
          </label>
        </div>
        <p className="payment-hint">{paymentHint}</p>
        <div className="summary-box premium-summary-box refined-summary-box">
          <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div><span>Phí ship</span><strong>{formatCurrency(shipping)}</strong></div>
          <div><span>Tổng cộng</span><strong>{formatCurrency(total)}</strong></div>
        </div>
        <button className="primary-btn full" onClick={handleCheckout} disabled={!cart.length || submitting}>
          {submitting ? 'Đang tạo đơn chuyển khoản...' : 'Tạo đơn và nhận mã QR'}
        </button>
        {message ? <p className="status-message error">{message}</p> : null}
      </div>
    </section>
  )
}

function CheckoutResultPage({
  onPaid,
}: {
  onPaid: () => void
}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderCode = searchParams.get('orderCode')
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!orderCode) {
      setMessage('Không tìm thấy mã đơn hàng.')
      setLoading(false)
      return
    }

    let cancelled = false
    const currentOrderCode = orderCode

    async function loadOrder() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/order?orderCode=${encodeURIComponent(currentOrderCode)}`)
        const data = await readApiJson<OrderDetail & { message?: string }>(response)
        if (!response.ok) {
          throw new Error(getApiMessage(data) ?? 'Không tải được đơn hàng.')
        }
        if (!data) {
          throw new Error('Phản hồi từ máy chủ không hợp lệ.')
        }
        if (!cancelled) {
          setOrder(data)
          saveStoredOrder(data)
          if (data.status === 'paid' || data.status === 'completed') {
            onPaid()
          }
        }
      } catch (error) {
        if (!cancelled) {
          const cachedOrder = getStoredOrder(currentOrderCode)
          if (cachedOrder) {
            setOrder(cachedOrder)
            if (cachedOrder.status === 'paid' || cachedOrder.status === 'completed') {
              onPaid()
            }
          } else {
            setMessage(error instanceof Error ? error.message : 'Không tải được đơn hàng.')
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOrder()
    return () => {
      cancelled = true
    }
  }, [orderCode, onPaid])

  return (
    <section className="container section-block checkout-layout single-column result-shell">
      <div className="admin-panel result-card-premium result-card-clean">
        <p className="eyebrow">Thanh toán VietQR</p>
        <h3>{loading ? 'Đang tải đơn hàng...' : order ? `Đơn hàng DH-${order.orderCode}` : 'Không có dữ liệu đơn hàng'}</h3>
        {message ? <p className="status-message error">{message}</p> : null}
        {order ? (
          <>
            <div className="summary-box status-box premium-summary-box refined-summary-box">
              <div><span>Trạng thái</span><strong>{orderStatusLabel(order.status)}</strong></div>
              <div><span>Tổng cộng</span><strong>{formatCurrency(order.total)}</strong></div>
              <div><span>Thanh toán</span><strong>{paymentLabel(order.paymentMethod)}</strong></div>
            </div>
            {order.paymentMethod === 'bank' ? (
              <>
                <p className="status-message info">
                  Quét mã VietQR bên dưới để chuyển đúng số tiền của đơn hàng.
                </p>
                <div className="admin-panel checkout-qr-panel">
                  {order.qrCode ? <img src={order.qrCode} alt={`Mã VietQR cho đơn hàng ${order.orderCode}`} className="checkout-qr-image" /> : null}
                  <div className="checkout-qr-meta">
                    <div><span>Ngân hàng</span><strong>{order.bankName ?? 'TPBank'}</strong></div>
                    <div><span>Số tài khoản</span><strong>{order.bankAccountNo ?? '00000802077'}</strong></div>
                    <div><span>Nội dung CK</span><strong>{order.transferNote ?? `DH${order.orderCode}`}</strong></div>
                  </div>
                </div>
                {order.cardModeUnlockedAt ? (
                  <p className="status-message info">Thẻ bài đã được mở khóa lúc {order.cardModeUnlockedAt}. Bạn có thể vào quiz để dùng chế độ thẻ bài.</p>
                ) : (
                  <p className="status-message info">Đơn hàng đã được tạo. Vui lòng quét QR và chuyển khoản đúng nội dung để shop xử lý đơn.</p>
                )}
              </>
            ) : null}
            <div className="cart-list">
              {order.items.map((item) => (
                <div key={item.id} className="cart-row cart-row-refined">
                  <div>
                    <strong>{item.productName}</strong>
                    <p>{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                  </div>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
            <div className="hero-actions hero-actions-compact">
              <button className="primary-btn" onClick={() => navigate('/quiz')}>Đến trang quiz</button>
              <button className="secondary-btn" onClick={() => navigate('/account')}>Xem đơn hàng của tôi</button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

function AccountPage({
  currentUser,
  authLoading,
  onAuthSuccess,
  onLogout,
}: {
  currentUser: AuthUser | null
  authLoading: boolean
  onAuthSuccess: (user: AuthUser) => void
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectState = (location.state ?? null) as { from?: string; reason?: string; message?: string } | null
  const redirectMessage = redirectState?.message ?? null
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    let cancelled = false
    const activeUser = currentUser

    async function loadOrders() {
      setOrdersLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/account-orders`, {
          credentials: 'include',
        })
        const data = await readApiJson<{ orders?: OrderDetail[]; message?: string }>(response)
        if (!response.ok) {
          throw new Error(getApiMessage(data) ?? 'Không tải được đơn hàng của tài khoản.')
        }
        if (!cancelled) {
          setOrders(data?.orders ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          const localOrders = loadStoredOrders().filter(
            (order) =>
              order.userId === activeUser.id ||
              order.email.trim().toLowerCase() === activeUser.email.trim().toLowerCase(),
          )
          setOrders(localOrders)
          setMessage(localOrders.length ? '' : error instanceof Error ? error.message : 'Không tải được đơn hàng của tài khoản.')
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false)
        }
      }
    }

    loadOrders()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (mode === 'register' && password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận chưa khớp.')
      return
    }

    setSubmitting(true)
    try {
      const user =
        mode === 'register'
          ? await registerUser({ fullName, email, password })
          : await loginUser({ email, password })
      onAuthSuccess(user)
      setPassword('')
      setConfirmPassword('')
      setMessage('')
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true })
      } else if (redirectState?.from) {
        navigate(redirectState.from, { replace: true })
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể xử lý đăng nhập.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <section className="container section-block auth-shell">
        <div className="auth-card auth-card-centered">
          <p className="status-message info">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </section>
    )
  }

  if (!currentUser) {
    return (
      <section className="container section-block auth-shell auth-shell-refined auth-shell-centered-bg">
        <form className="auth-card auth-card-refined auth-card-centered-screen auth-card-floating" onSubmit={handleSubmit}>
          <div className="auth-switch-row">
            <button type="button" className={`auth-switch ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Đăng nhập</button>
            <button type="button" className={`auth-switch ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Tạo tài khoản</button>
          </div>
          <p className="eyebrow dark">{mode === 'login' ? 'Đăng nhập học viên' : 'Tạo tài khoản mới'}</p>
          <h3>{mode === 'login' ? 'Vào tài khoản' : 'Bắt đầu với tài khoản thật'}</h3>
          {redirectMessage ? <p className="status-message info">{redirectMessage}</p> : null}
          {mode === 'register' ? (
            <label>
              Họ tên
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Văn A" />
            </label>
          ) : null}
          <label>
            Email hoặc SĐT
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com hoặc 09xxxxxxxx" />
          </label>
          <label>
            Mật khẩu
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 8 ký tự" />
          </label>
          {mode === 'register' ? (
            <label>
              Xác nhận mật khẩu
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu" />
            </label>
          ) : null}
          <button className="primary-btn full" type="submit" disabled={submitting}>
            <CheckCircle2 size={16} />
            {submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
          {message ? <p className="status-message error">{message}</p> : null}
        </form>
      </section>
    )
  }

  return (
    <section className="container section-block learner-account-shell">
      <div className="learner-hero-panel">
        <div className="learner-profile-block">
          <div className="learner-avatar">{getInitials(currentUser.fullName)}</div>
          <div>
            <p className="eyebrow">Tài khoản người học</p>
            <h2>{currentUser.fullName}</h2>
            <p>{currentUser.email}</p>
          </div>
        </div>
        <div className="learner-hero-actions">
          <Link to="/quiz" className="secondary-btn">
            <Award size={16} />
            Luyện quiz
          </Link>
          <button className="ghost-btn light" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="learner-dashboard-grid learner-dashboard-grid-empty">
        <div className="learner-main-stack">
          <div className="account-section-heading">
            <div>
              <p className="eyebrow dark">Hồ sơ học tập</p>
              <h3>{orders.length ? 'Đã bắt đầu mua hàng' : 'Chưa có tiến độ học tập'}</h3>
            </div>
            <span>{orders.length ? `${orders.length} đơn` : '0% hoàn thành'}</span>
          </div>

          <div className="learner-metrics-grid">
            <article className="metric-card learner-metric-card">
              <span>Điểm hiện tại</span>
              <strong>0</strong>
              <small>Bắt đầu quiz hoặc mua hàng để tích điểm đầu tiên</small>
            </article>
            <article className="metric-card learner-metric-card">
              <span>Bài học hoàn thành</span>
              <strong>0/0</strong>
              <small>Bạn chưa hoàn thành bài học nào</small>
            </article>
            <article className="metric-card learner-metric-card">
              <span>Đơn hàng</span>
              <strong>{orders.length}</strong>
              <small>{orders.length ? 'Đồng bộ từ đơn hàng thật của tài khoản' : 'Chưa có đơn hàng nào gắn với tài khoản này'}</small>
            </article>
          </div>

          <div className="admin-panel learning-progress-panel empty-state-panel">
            <div>
              <p className="eyebrow dark">Đơn hàng của bạn</p>
              <h3>{orders.length ? 'Lịch sử mua hàng thật' : 'Tài khoản của bạn đang trống'}</h3>
              <p>
                {orders.length
                  ? 'Các đơn hàng bên dưới được lấy từ dữ liệu thật đã checkout bằng tài khoản hiện tại.'
                  : 'Hãy bắt đầu với một bài học, thử quiz hoặc thêm bộ thẻ đầu tiên vào giỏ để hệ thống tạo dữ liệu thật cho hồ sơ của bạn.'}
              </p>
            </div>
            {ordersLoading ? (
              <p className="status-message info compact">Đang tải đơn hàng của tài khoản...</p>
            ) : orders.length ? (
              <div className="cart-list">
                {orders.map((order) => (
                  <div key={order.id} className="cart-row cart-row-refined">
                    <div>
                      <strong>DH-{order.orderCode}</strong>
                      <p>{order.createdAt}</p>
                    </div>
                    <div>
                      <span className={`status-pill ${order.status}`}>{orderStatusLabel(order.status)}</span>
                      <p>{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hero-actions hero-actions-compact">
                <Link to="/lessons" className="secondary-btn">Xem bài học</Link>
                <Link to="/products" className="primary-btn">Mua thẻ đầu tiên</Link>
              </div>
            )}
          </div>
        </div>

        <aside className="admin-panel learner-activity-panel empty-state-panel">
          <div className="account-section-heading compact">
            <div>
              <p className="eyebrow dark">Hoạt động gần đây</p>
              <h3>{orders.length ? 'Đang dùng dữ liệu thật' : 'Chưa có hoạt động nào'}</h3>
            </div>
          </div>
          <p className="empty-state-copy">
            {orders.length
              ? 'Trang tài khoản không còn dựng sẵn timeline hay reward giả; dữ liệu chỉ xuất hiện khi tài khoản có hoạt động thật.'
              : 'Khi bạn hoàn thành quiz hoặc tạo đơn hàng thật, lịch sử hoạt động sẽ xuất hiện tại đây thay vì dữ liệu demo.'}
          </p>
        </aside>
      </div>
    </section>
  )
}

function DashboardPage({
  currentUser,
  authLoading,
}: {
  currentUser: AuthUser | null
  authLoading: boolean
}) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading || !currentUser || currentUser.role !== 'admin') return

    let cancelled = false
    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          credentials: 'include',
        })
        const data = await readApiJson<DashboardData & { message?: string }>(response)
        if (!response.ok) {
          throw new Error(getApiMessage(data) ?? 'Không tải được dashboard.')
        }
        if (!data) {
          throw new Error('Phản hồi từ máy chủ không hợp lệ.')
        }
        if (!cancelled) {
          setDashboard(data)
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Không tải được dashboard.')
        }
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [authLoading, currentUser])

  if (authLoading) {
    return (
      <section className="container section-block dashboard-shell-premium">
        <p className="status-message info">Đang kiểm tra quyền truy cập dashboard...</p>
      </section>
    )
  }

  if (!currentUser) {
    return (
      <section className="container section-block dashboard-shell-premium">
        <div className="admin-panel">
          <p className="eyebrow dark">Admin dashboard</p>
          <h3>Cần đăng nhập admin</h3>
          <p>Dashboard chỉ dành cho tài khoản có role admin.</p>
          <Link to="/account" className="primary-btn">Đăng nhập</Link>
        </div>
      </section>
    )
  }

  if (currentUser.role !== 'admin') {
    return (
      <section className="container section-block dashboard-shell-premium">
        <div className="admin-panel">
          <p className="eyebrow dark">Không có quyền</p>
          <h3>Tài khoản này không phải admin</h3>
          <p>Vui lòng dùng tài khoản admin để xem dashboard vận hành.</p>
          <Link to="/account" className="secondary-btn">Về tài khoản</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container section-block dashboard-shell-premium">
      <div className="section-heading section-heading-balanced">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h3>Vận hành toàn bộ nền tảng</h3>
        </div>
        <Link to="/quiz" className="secondary-btn">Xem đấu trường quiz</Link>
      </div>
      {message ? <p className="status-message error">{message}</p> : null}
      <DashboardOverview metrics={dashboard?.metrics ?? []} orders={dashboard?.orders ?? []} />
      <div className="dashboard-grid lower refined-layout-two-column">
        <div className="admin-panel">
          <h4>Quản lý nội dung</h4>
          <ul className="feature-list feature-list-spacious">
            <li>Bài học và quiz hiện vẫn đang dùng dữ liệu mẫu để demo luồng.</li>
            <li>Shop có thể mở rộng CRUD riêng sau khi chốt xong catalog và checkout thật.</li>
            <li>Ưu tiên hiện tại là giữ phần mua hàng và thanh toán đồng nhất hơn.</li>
          </ul>
        </div>
        <div className="admin-panel">
          <h4>Quản lý thương mại</h4>
          <ul className="feature-list feature-list-spacious">
            <li>Doanh thu và đơn hàng lấy từ dữ liệu order hiện có trong hệ thống.</li>
            <li>Đối soát đang hỗ trợ PayOS / QR, COD và chuyển khoản thủ công.</li>
            <li>Các chỉ số phụ như lượt luyện tập vẫn được gắn nhãn mock để tránh gây hiểu nhầm.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [catalog, setCatalog] = useState(() => getShowcaseProducts(fallbackProducts))
  const [catalogLoading, setCatalogLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser()
        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null)
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    loadCurrentUser()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        setCatalogLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/products`)
        const data = await readApiJson<typeof fallbackProducts | { message?: string }>(response)
        if (!response.ok) {
          throw new Error(getApiMessage(data) ?? 'Không tải được catalog.')
        }
        if (!Array.isArray(data)) {
          throw new Error('Phản hồi từ máy chủ không hợp lệ.')
        }

        if (!cancelled) {
          setCatalog(getShowcaseProducts(data))
        }
      } catch (error) {
        if (!cancelled) {
          setCatalog(getShowcaseProducts(fallbackProducts))
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    }

    loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (catalogLoading) return

    setCart((prev) => {
      const synced = syncCartWithCatalog(prev, catalog)
      if (JSON.stringify(prev) !== JSON.stringify(synced)) {
        saveCart(synced)
      }
      return synced
    })
  }, [catalog, catalogLoading])

  function handleAdd(productId: string) {
    if (!currentUser) {
      navigate('/account', {
        state: {
          from: '/products',
          reason: 'add-to-cart',
          message: 'Bạn cần đăng nhập trước khi thêm thẻ bài vào giỏ hàng.',
        },
      })
      return
    }
    const product = catalog.find((entry) => entry.id === productId)
    setCart((prev) => {
      const next = addToCart(prev, productId, product?.stock)
      saveCart(next)
      return next
    })
  }

  function handleSetCart(nextCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) {
    setCart((prev) => {
      const resolved = typeof nextCart === 'function' ? nextCart(prev) : nextCart
      saveCart(resolved)
      return resolved
    })
  }

  function handleOrderPaid() {
    setCart([])
    saveCart([])
  }

  function handleAuthSuccess(user: AuthUser) {
    setCurrentUser(user)
  }

  async function handleLogout() {
    try {
      await logoutUser()
    } finally {
      setCurrentUser(null)
    }
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const featuredProduct = catalog[0] ?? null
  const isAdminRoute = location.pathname.startsWith('/dashboard')
  const isAccountRoute = location.pathname === '/account'

  return (
    <div className="app-shell">
      {!isAdminRoute ? (
        <Header cartCount={cartCount} learnerName={currentUser?.fullName} isAdmin={currentUser?.role === 'admin'} onLogout={handleLogout} />
      ) : null}
      <Routes>
        <Route path="/" element={<HomePage featuredProduct={featuredProduct} />} />
        <Route path="/products" element={<ProductsPage products={catalog} loading={catalogLoading} onAdd={handleAdd} />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:slug" element={<LessonDetailPage />} />
        <Route path="/quiz" element={<QuizPage currentUser={currentUser} />} />
        <Route path="/ar" element={<Navigate to="/quiz" replace />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} products={catalog} catalogLoading={catalogLoading} currentUser={currentUser} setCart={handleSetCart} />} />
        <Route path="/checkout/success" element={<CheckoutResultPage onPaid={handleOrderPaid} />} />
        <Route path="/checkout/cancel" element={<CheckoutResultPage onPaid={handleOrderPaid} />} />
        <Route path="/account" element={<AccountPage currentUser={currentUser} authLoading={authLoading} onAuthSuccess={handleAuthSuccess} onLogout={handleLogout} />} />
        <Route path="/dashboard/*" element={<AdminDashboard currentUser={currentUser} authLoading={authLoading} onLogout={handleLogout} />} />
      </Routes>
      {!isAdminRoute && !isAccountRoute ? <Footer /> : null}
    </div>
  )
}
