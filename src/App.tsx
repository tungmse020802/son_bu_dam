import { Award, CheckCircle2, Crown, Rocket, Sparkles, Swords } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminDashboard } from './components/AdminDashboard'
import { DashboardOverview } from './components/DashboardOverview'
import { Footer, Header } from './components/Layout'
import { LessonCard } from './components/LessonCard'
import { ProductCard } from './components/ProductCard'
import { arExperiences, characters, lessons, products as fallbackProducts } from './data/mockData'
import { historyQuiz } from './data/quizData'
import type { AuthUser, CartItem, CheckoutResponse, DashboardData, OrderDetail, PaymentMethod } from './types/app'
import { API_BASE_URL } from './utils/api'
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

function HomePage({
  onAdd,
  featuredProduct,
}: {
  onAdd: (productId: string) => void
  featuredProduct: (typeof fallbackProducts)[number] | null
}) {
  return (
    <>
      <section className="hero-section hero-section-premium">
        <div className="container hero-grid hero-grid-premium">
          <div className="hero-copy">
            <div className="hero-badge">
              <Sparkles size={16} />
              Hệ sinh thái học sử kết hợp AR, commerce và quiz
            </div>
            <p className="eyebrow">Công nghệ AR cho giáo dục lịch sử Việt Nam</p>
            <h2>Học Sử chủ động, trải nghiệm sống động cùng Sử Việt Anh Minh</h2>
            <p className="hero-description">
              Hệ sinh thái kết hợp giữa bài học trực quan, thẻ bài sưu tầm và hệ thống thử thách quiz tương tác thông minh.
            </p>
            <div className="hero-actions hero-actions-compact">
              <Link to="/quiz" className="primary-btn">Bắt đầu quiz ngay</Link>
              <Link to="/products" className="secondary-btn">Xem bộ sưu tập</Link>
            </div>
          </div>

          <div className="hero-stage-card hero-stage-card-clean hero-stage-card-minimal">
            {featuredProduct ? (
              <>
                <div className="hero-stage-top">
                  <span className="eyebrow dark">Combo + quiz + AR</span>
                  <strong>{featuredProduct.name}</strong>
                  <p>{featuredProduct.subtitle}</p>
                </div>
                <img src={featuredProduct.image} alt={featuredProduct.name} className="hero-stage-image" />
              </>
            ) : (
              <div className="hero-stage-top">
                <span className="eyebrow dark">Combo + quiz + AR</span>
                <strong>Danh mục đang cập nhật</strong>
                <p>Shop đang tải lại bộ sưu tập phù hợp cho hành trình học và sưu tầm.</p>
              </div>
            )}
            <Link to="/products" className="secondary-btn full hero-stage-link">Khám phá bộ sưu tập</Link>
          </div>
        </div>
      </section>

      <section className="container section-block section-tight section-tight-topless">
        <div className="section-heading section-heading-balanced">
          <div>
            <p className="eyebrow">Trải nghiệm chính</p>
            <h3>3 hành trình nổi bật trong cùng một sản phẩm</h3>
          </div>
        </div>
        <div className="feature-grid feature-grid-refined">
          <article className="feature-card feature-card-refined">
            <div className="feature-visual">
              <img src="/assets/bg1.jpg" alt="Thẻ bài lịch sử" />
            </div>
            <div className="feature-card-body">
              <Crown size={18} />
              <h4>Mua combo lịch sử</h4>
              <p>Chọn thẻ bài theo lớp, combo theo chủ đề và checkout bằng PayOS hoặc COD.</p>
            </div>
          </article>
          <article className="feature-card feature-card-refined">
            <div className="feature-visual">
              <img src="/assets/ar.jpg" alt="Quét AR" />
            </div>
            <div className="feature-card-body">
              <Rocket size={18} />
              <h4>Quét AR tương tác</h4>
              <p>Mở nhân vật, nhận phần thưởng và chuyển tiếp sang luồng luyện tập kiến thức.</p>
            </div>
          </article>
          <article className="feature-card feature-card-refined">
            <div className="feature-visual">
              <img src="/assets/hs.jpg" alt="Quiz lịch sử" />
            </div>
            <div className="feature-card-body">
              <Swords size={18} />
              <h4>Đấu trường quiz</h4>
              <p>Chơi 30 câu hỏi nhiều cấp độ với giải thích chi tiết và màn tổng kết kết quả rõ ràng.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="container section-block combo-showcase-grid">
        <div className="combo-copy-block">
          <p className="eyebrow">Combo nổi bật</p>
          <h3>{featuredProduct?.name ?? 'Danh mục đang cập nhật'}</h3>
          <p>{featuredProduct?.description ?? 'Khi catalog tải xong, shop sẽ hiển thị combo tiêu biểu để người học thêm vào giỏ nhanh hơn.'}</p>
          <ul className="feature-list feature-list-spacious">
            {(featuredProduct?.features ?? ['Thẻ bài sưu tầm', 'Quiz theo chủ đề', 'AR mở khóa nhân vật']).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="hero-actions hero-actions-compact">
            <button className="primary-btn" onClick={() => featuredProduct && onAdd(featuredProduct.id)} disabled={!featuredProduct}>
              Thêm combo vào giỏ
            </button>
            <Link to="/quiz" className="ghost-btn light">Luyện quiz trước khi mua</Link>
          </div>
        </div>

        <div className="combo-info-stack">
          <div className="summary-card summary-card-highlight">
            <span className="eyebrow dark">Quiz nổi bật</span>
            <strong>{historyQuiz.title}</strong>
            <p>{historyQuiz.description}</p>
            <div className="summary-inline-metrics">
              <div><strong>{historyQuiz.questionCount}</strong><span>Câu hỏi</span></div>
              <div><strong>3</strong><span>Cấp độ</span></div>
            </div>
            <Link to="/quiz" className="secondary-btn full">Bắt đầu thử thách</Link>
          </div>

          <div className="summary-card summary-card-soft summary-card-clean">
            <span className="eyebrow dark">Lối chơi</span>
            <strong>Học → Chơi → Mua</strong>
            <p>Hoàn thành quiz để ghi nhớ kiến thức, sau đó chuyển sang AR hoặc chọn combo phù hợp với chủ đề bạn vừa học.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function ProductsPage({
  products,
  loading,
  error,
  onAdd,
}: {
  products: (typeof fallbackProducts)
  loading: boolean
  error: string
  onAdd: (productId: string) => void
}) {
  const [gradeFilter, setGradeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const gradeOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.grade))),
    [products],
  )
  const typeOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.type))),
    [products],
  )

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesGrade = gradeFilter === 'all' || product.grade === gradeFilter
        const matchesType = typeFilter === 'all' || product.type === typeFilter
        return matchesGrade && matchesType
      }),
    [products, gradeFilter, typeFilter],
  )

  return (
    <section className="container section-block catalog-layout catalog-layout-stacked">
      <aside className="filter-panel filter-panel-clean filter-panel-products filter-panel-horizontal">
        <div>
          <p className="eyebrow">Bộ lọc</p>
          <h3>Tùy chỉnh danh mục</h3>
        </div>
        <label>
          Lớp
          <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </label>
        <label>
          Loại nhân vật
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
      </aside>
      <div>
        <div className="section-heading section-heading-balanced product-toolbar-heading">
          <div>
            <p className="eyebrow">Catalog</p>
            <h3>Sản phẩm & thẻ nhân vật</h3>
          </div>
        </div>
        {error ? <p className="status-message warning">{error}</p> : null}
        {loading ? <div className="catalog-state-card">Đang tải catalog từ backend...</div> : null}
        {!loading && filteredProducts.length === 0 ? <div className="catalog-state-card">Không có sản phẩm phù hợp với bộ lọc hiện tại.</div> : null}
        <div className="product-grid product-grid-refined product-grid-showcase">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LessonsPage() {
  return (
    <section className="container section-block">
      <div className="section-heading section-heading-balanced">
        <div>
          <p className="eyebrow">Learning module</p>
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [qrScanned, setQrScanned] = useState(false)

  const question = historyQuiz.questions[currentIndex]
  const progress = ((currentIndex + (showResult ? 1 : 0)) / historyQuiz.questionCount) * 100
  const answeredCount = Object.keys(answers).length

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
    if (currentIndex === historyQuiz.questions.length - 1) {
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
    setQrScanned(false)
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
          <span>Quét QR</span>
          <span>Chọn câu hỏi</span>
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
      ) : !qrScanned ? (
        <div className="admin-panel quiz-access-panel quiz-access-panel-clean">
          <div>
            <p className="eyebrow dark">Bước 2</p>
            <h3>Quét QR trên thẻ bài</h3>
            <p>Quét mã QR đi kèm bộ thẻ Sử Việt Anh Minh để mở khóa phiên quiz tương tác.</p>
          </div>
          <div className="quiz-qr-card" aria-label="Mã QR mô phỏng để mở khóa quiz">
            <span />
            <strong>QR</strong>
            <small>Sử Việt Anh Minh</small>
          </div>
          <button className="primary-btn" onClick={() => setQrScanned(true)}>Tôi đã quét QR</button>
        </div>
      ) : showResult ? (
        <div className="quiz-result-panel admin-panel quiz-result-panel-clean">
          <div className="result-ring result-ring-clean">
            <strong>{score}/{historyQuiz.questionCount}</strong>
            <span>Điểm tổng kết</span>
          </div>
          <div>
            <h3>Hoàn thành đấu trường lịch sử</h3>
            <p>
              Bạn đã trả lời đúng {score} / {historyQuiz.questionCount} câu. Hãy luyện lại hoặc chuyển sang trải nghiệm AR và mua bộ thẻ liên quan.
            </p>
            <div className="hero-actions hero-actions-compact">
              <button className="primary-btn" onClick={handleRestart}>Chơi lại từ đầu</button>
              <Link to="/products" className="secondary-btn">Mua bộ thẻ nổi bật</Link>
              <Link to="/ar" className="ghost-btn light">Tiếp tục trải nghiệm AR</Link>
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
                  {currentIndex === historyQuiz.questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                </button>
              )}
              <button className="secondary-btn" onClick={handleNext}>
                {currentIndex === historyQuiz.questions.length - 1 ? 'Xem kết quả' : 'Next'}
              </button>
            </div>
          </div>

          <aside className="admin-panel quiz-side-panel quiz-side-panel-clean">
            <p className="eyebrow dark">Tiến trình</p>
            <h3>Đấu trường của bạn</h3>
            <div className="quiz-side-stats quiz-side-stats-clean">
              <div><strong>{answeredCount}</strong><span>Đã làm</span></div>
              <div><strong>{currentIndex + 1}</strong><span>Đang chơi</span></div>
              <div><strong>{historyQuiz.questionCount - answeredCount}</strong><span>Còn lại</span></div>
            </div>
            <div className="quiz-check-grid quiz-check-grid-clean">
              {historyQuiz.questions.map((item, index) => {
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
    </section>
  )
}

function ArPage() {
  const [selectedMarker, setSelectedMarker] = useState(arExperiences[0].markerId)
  const experience = arExperiences.find((entry) => entry.markerId === selectedMarker) ?? arExperiences[0]
  const character = characters.find((entry) => entry.id === experience.characterId)

  return (
    <section className="container section-block split-section refined-layout-two-column">
      <div className="admin-panel ar-panel-premium">
        <p className="eyebrow">AR flow MVP</p>
        <h3>{experience.title}</h3>
        <p>{experience.description}</p>
        <label>
          Chọn marker mô phỏng
          <select value={selectedMarker} onChange={(event) => setSelectedMarker(event.target.value)}>
            {arExperiences.map((entry) => (
              <option key={entry.markerId} value={entry.markerId}>
                {entry.title}
              </option>
            ))}
          </select>
        </label>
        <div className="quiz-box">
          <strong>Điểm thưởng sau khi quét: {experience.rewardPoints}</strong>
          {experience.questions.map((question) => (
            <div key={question.id} className="quiz-question">
              <p>{question.prompt}</p>
              <ul>
                {question.options.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link to="/quiz" className="secondary-btn full">Chuyển sang đấu trường quiz đầy đủ</Link>
      </div>
      <div className="hero-card elevated character-panel">
        {character ? <img src={character.image} alt={character.name} /> : null}
        <div className="character-sheet">
          <h4>{character?.name}</h4>
          <p>{character?.blurb}</p>
          <span>{character?.period}</span>
        </div>
      </div>
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    setCustomerName((prev) => prev || currentUser.fullName)
    setEmail((prev) => prev || currentUser.email)
  }, [currentUser])

  const subtotal = calculateSubtotal(cart, products)
  const shipping = subtotal > 0 ? 30000 : 0
  const total = subtotal + shipping
  const paymentHint =
    paymentMethod === 'momo'
      ? 'Bạn sẽ được chuyển sang PayOS / QR để hoàn tất thanh toán.'
      : paymentMethod === 'cod'
        ? 'Đơn hàng sẽ được ghi nhận ngay và chờ shop xác nhận.'
        : 'Đơn chuyển khoản sẽ được tạo trước, sau đó shop xác nhận thủ công.'

  async function handleCheckout() {
    setSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, email, address, paymentMethod, cart }),
      })
      const data = (await response.json()) as CheckoutResponse & { message?: string }
      if (!response.ok) {
        setMessage(data.message ?? 'Checkout thất bại.')
        return
      }

      if (data.order) {
        saveStoredOrder(data.order)
      }

      if (data.paymentMethod === 'cod' || data.paymentMethod === 'bank') {
        navigate(`/checkout/success?orderCode=${data.orderCode}`)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setMessage('Không lấy được link thanh toán.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container section-block checkout-layout checkout-layout-premium refined-layout-two-column">
      <div className="admin-panel checkout-card-premium checkout-card-primary">
        <div className="section-heading section-heading-balanced">
          <div>
            <p className="eyebrow">Checkout</p>
            <h3>Giỏ hàng & thanh toán</h3>
          </div>
          <Link to="/quiz" className="ghost-btn light">Luyện quiz trước khi mua</Link>
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
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              <option value="momo">PayOS / QR</option>
              <option value="cod">COD</option>
              <option value="bank">Chuyển khoản</option>
            </select>
          </label>
        </div>
        <p className="payment-hint">{paymentHint}</p>
        <div className="summary-box premium-summary-box refined-summary-box">
          <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div><span>Phí ship</span><strong>{formatCurrency(shipping)}</strong></div>
          <div><span>Tổng cộng</span><strong>{formatCurrency(total)}</strong></div>
        </div>
        <button className="primary-btn full" onClick={handleCheckout} disabled={!cart.length || submitting}>
          {submitting ? 'Đang tạo thanh toán...' : 'Hoàn tất thanh toán'}
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
  const location = useLocation()
  const navigate = useNavigate()
  const orderCode = searchParams.get('orderCode')
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const isCancelPage = location.pathname.includes('/cancel')

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
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message ?? 'Không tải được đơn hàng.')
        }
        if (!cancelled) {
          setOrder(data as OrderDetail)
          saveStoredOrder(data as OrderDetail)
          if ((data as OrderDetail).status === 'paid' || (data as OrderDetail).paymentMethod === 'cod') {
            onPaid()
          }
        }
      } catch (error) {
        if (!cancelled) {
          const cachedOrder = getStoredOrder(currentOrderCode)
          if (cachedOrder) {
            setOrder(cachedOrder)
            if (cachedOrder.status === 'paid' || cachedOrder.paymentMethod === 'cod') {
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

  async function handleMockConfirm() {
    if (!orderCode) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/mock-order-pay?orderCode=${encodeURIComponent(String(orderCode))}`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể xác nhận thanh toán.')
      }
      setOrder(data as OrderDetail)
      saveStoredOrder(data as OrderDetail)
      onPaid()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể xác nhận thanh toán.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRetry() {
    if (!orderCode) return
    const response = await fetch(`${API_BASE_URL}/api/order-retry-payment?orderCode=${encodeURIComponent(String(orderCode))}`, { method: 'POST' })
    const data = await response.json()
    if (!response.ok) {
      setMessage(data.message ?? 'Không thể tạo lại link thanh toán.')
      return
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl as string
    }
  }

  return (
    <section className="container section-block checkout-layout single-column result-shell">
      <div className="admin-panel result-card-premium result-card-clean">
        <p className="eyebrow">{isCancelPage ? 'Thanh toán bị hủy' : 'Kết quả thanh toán'}</p>
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
              <p className="status-message info">Đơn chuyển khoản đã được tạo. Shop sẽ xác nhận sau khi nhận tiền vào tài khoản.</p>
            ) : null}
            {order.paymentMethod === 'cod' ? (
              <p className="status-message info">Đơn COD đã được ghi nhận. Shop sẽ liên hệ để xác nhận và chuẩn bị giao hàng.</p>
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
              {isCancelPage && order.status !== 'paid' && order.paymentMethod === 'momo' ? (
                <button className="secondary-btn" onClick={handleRetry}>Thanh toán lại</button>
              ) : null}
              <button className="ghost-btn light" onClick={() => navigate('/dashboard')}>Xem dashboard</button>
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
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message ?? 'Không tải được đơn hàng của tài khoản.')
        }
        if (!cancelled) {
          setOrders((data.orders as OrderDetail[]) ?? [])
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
              <small>Bắt đầu quiz hoặc AR để tích điểm đầu tiên</small>
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
              : 'Khi bạn hoàn thành quiz, quét AR hoặc tạo đơn hàng thật, lịch sử hoạt động sẽ xuất hiện tại đây thay vì dữ liệu demo.'}
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
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message ?? 'Không tải được dashboard.')
        }
        if (!cancelled) {
          setDashboard(data as DashboardData)
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
            <li>Bài học, quiz và AR hiện vẫn đang dùng dữ liệu mẫu để demo luồng.</li>
            <li>Shop có thể mở rộng CRUD riêng sau khi chốt xong catalog và checkout thật.</li>
            <li>Ưu tiên hiện tại là giữ phần mua hàng và thanh toán đồng nhất hơn.</li>
          </ul>
        </div>
        <div className="admin-panel">
          <h4>Quản lý thương mại</h4>
          <ul className="feature-list feature-list-spacious">
            <li>Doanh thu và đơn hàng lấy từ dữ liệu order hiện có trong hệ thống.</li>
            <li>Đối soát đang hỗ trợ PayOS / QR, COD và chuyển khoản thủ công.</li>
            <li>Các chỉ số ngoài order như AR scan vẫn được gắn nhãn mock để tránh gây hiểu nhầm.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [catalog, setCatalog] = useState(fallbackProducts)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogMessage, setCatalogMessage] = useState('')

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
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message ?? 'Không tải được catalog.')
        }

        if (!cancelled) {
          setCatalog(data)
          setCatalogMessage('')
        }
      } catch (error) {
        if (!cancelled) {
          setCatalog(fallbackProducts)
          setCatalogMessage('Không kết nối được catalog backend, đang dùng dữ liệu dự phòng.')
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
        <Route path="/" element={<HomePage onAdd={handleAdd} featuredProduct={featuredProduct} />} />
        <Route path="/products" element={<ProductsPage products={catalog} loading={catalogLoading} error={catalogMessage} onAdd={handleAdd} />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:slug" element={<LessonDetailPage />} />
        <Route path="/quiz" element={<QuizPage currentUser={currentUser} />} />
        <Route path="/ar" element={<ArPage />} />
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
