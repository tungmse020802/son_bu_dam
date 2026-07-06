import { useEffect, useState } from 'react'
import { ImageUploadField } from './ImageUploadField'
import type { FormEvent } from 'react'
import { BookPlus, ChevronLeft, Image as ImageIcon, PackagePlus, Pencil, Search, Tags, Users } from 'lucide-react'
import { characters } from '../data/mockData'
import type { Lesson, Product, ProductType } from '../types/app'
import { API_BASE_URL, getApiMessage, readApiJson } from '../utils/api'
import { formatCurrency } from '../utils/store'

const GRADE_OPTIONS = ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9']
const PRODUCT_TYPE_OPTIONS: ProductType[] = ['Vua', 'Tướng lĩnh', 'Anh hùng', 'Công chúa']

async function getAdmin<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })
  const data = await readApiJson<T & { message?: string }>(response)
  if (!response.ok) throw new Error(getApiMessage(data) ?? 'Không tải được dữ liệu.')
  if (!data) throw new Error('Phản hồi từ máy chủ không hợp lệ.')
  return data as T
}

async function sendAdmin<T>(path: string, method: 'POST' | 'PUT', body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await readApiJson<T & { message?: string }>(response)
  if (!response.ok) throw new Error(getApiMessage(data) ?? 'Yêu cầu thất bại.')
  if (!data) throw new Error('Phản hồi từ máy chủ không hợp lệ.')
  return data as T
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="admin-form-section">
      <div className="admin-form-section-heading">
        <span className="admin-form-section-icon">{icon}</span>
        <div>
          <h4>{title}</h4>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      <div className="admin-form-section-body">{children}</div>
    </div>
  )
}

function CharacterCheckboxList({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((entry) => entry !== id) : [...selectedIds, id])
  }

  return (
    <div className="admin-character-picker">
      {characters.map((character) => {
        const checked = selectedIds.includes(character.id)
        return (
          <label key={character.id} className={`admin-character-picker-item ${checked ? 'checked' : ''}`}>
            <input type="checkbox" checked={checked} onChange={() => toggle(character.id)} />
            <span className="admin-character-picker-name">{character.name}</span>
            <small>{character.grade}</small>
          </label>
        )
      })}
    </div>
  )
}

// ---------- FORM BÀI HỌC (dùng chung cho Thêm mới & Chỉnh sửa) ----------
function LessonForm({ initial, onSaved, onCancel }: { initial?: Lesson; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [grade, setGrade] = useState(initial?.grade ?? GRADE_OPTIONS[0])
  const [period, setPeriod] = useState(initial?.period ?? '')
  const [duration, setDuration] = useState(initial?.duration ?? '20 phút')
  const [image, setImage] = useState(initial?.image ?? '')
  const [objectives, setObjectives] = useState(initial?.objectives.join('\n') ?? '')
  const [content, setContent] = useState(initial?.content.join('\n') ?? '')
  const [historicalLesson, setHistoricalLesson] = useState(initial?.historicalLesson ?? '')
  const [inspirationMessage, setInspirationMessage] = useState(initial?.inspirationMessage ?? '')
  const [relatedCharacterIds, setRelatedCharacterIds] = useState<string[]>(initial?.relatedCharacterIds ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const payload = {
        title, summary, grade, period, duration, image, objectives, content,
        historicalLesson, inspirationMessage, relatedCharacterIds,
      }
      if (initial) {
        await sendAdmin<{ lesson: Lesson }>(`/api/admin/lessons/${initial.id}`, 'PUT', payload)
        setSuccess(true)
        setMessage('Đã cập nhật bài học thành công.')
      } else {
        await sendAdmin<{ lesson: Lesson }>('/api/admin/lessons', 'POST', payload)
        setSuccess(true)
        setMessage('Đã thêm bài học mới thành công. Bài học đã xuất hiện ở trang Bài học.')
      }
      onSaved()
    } catch (error) {
      setSuccess(false)
      setMessage(error instanceof Error ? error.message : 'Không thể lưu bài học.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-content-form" onSubmit={handleSubmit}>
      <button type="button" className="admin-back-link admin-back-link-btn" onClick={onCancel}>
        <ChevronLeft size={16} /> Quay lại danh sách bài học
      </button>

      <FormSection icon={<BookPlus size={18} />} title="Thông tin chung" description="Tiêu đề, tóm tắt và phân loại bài học.">
        <div className="admin-form-grid admin-form-grid-2">
          <label className="admin-form-field admin-form-field-full">
            Tiêu đề bài học
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bà Triệu – Khát vọng tự do" required />
          </label>
          <label className="admin-form-field admin-form-field-full">
            Tóm tắt ngắn
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Tóm tắt 1-2 câu hiển thị ở thẻ bài học" required />
          </label>
          <label className="admin-form-field">
            Khối lớp
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="admin-form-field">
            Thời kỳ lịch sử
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="VD: Bắc Thuộc" />
          </label>
          <label className="admin-form-field">
            Thời lượng học
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="VD: 20 phút" />
          </label>
        </div>
      </FormSection>

      <FormSection icon={<ImageIcon size={18} />} title="Hình ảnh minh hoạ">
        <div className="admin-form-grid admin-form-grid-2">
          <div className="admin-form-field admin-form-field-full">
  <span>Ảnh minh hoạ</span>
  <ImageUploadField value={image} onChange={setImage} />
  <small className="admin-form-hint">Để trống nếu chưa có ảnh, hệ thống sẽ dùng ảnh mặc định.</small>
</div>
        </div>
      </FormSection>

      <FormSection icon={<Tags size={18} />} title="Nội dung bài học" description="Mỗi dòng tương ứng với 1 mục/đoạn văn.">
        <div className="admin-form-grid admin-form-grid-2">
          <label className="admin-form-field admin-form-field-full">
            Mục tiêu bài học
            <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows={3} placeholder={'Mỗi dòng 1 mục tiêu'} />
          </label>
          <label className="admin-form-field admin-form-field-full">
            Nội dung bài học
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder={'Mỗi dòng 1 đoạn văn'} required />
          </label>
          <label className="admin-form-field">
            Bài học lịch sử rút ra (tuỳ chọn)
            <textarea value={historicalLesson} onChange={(e) => setHistoricalLesson(e.target.value)} rows={2} />
          </label>
          <label className="admin-form-field">
            Thông điệp truyền cảm hứng (tuỳ chọn)
            <textarea value={inspirationMessage} onChange={(e) => setInspirationMessage(e.target.value)} rows={2} />
          </label>
        </div>
      </FormSection>

      <FormSection icon={<Users size={18} />} title="Nhân vật liên quan">
        <CharacterCheckboxList selectedIds={relatedCharacterIds} onChange={setRelatedCharacterIds} />
      </FormSection>

      <div className="admin-content-form-footer">
        <button className="primary-btn" type="submit" disabled={submitting}>
          <BookPlus size={16} />
          {submitting ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm bài học mới'}
        </button>
        {message ? <p className={`status-message ${success ? 'info' : 'error'} compact`}>{message}</p> : null}
      </div>
    </form>
  )
}

// ---------- FORM SẢN PHẨM (dùng chung cho Thêm mới & Chỉnh sửa) ----------
function ProductForm({ initial, onSaved, onCancel }: { initial?: Product; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice ? String(initial.originalPrice) : '')
  const [grade, setGrade] = useState(initial?.grade ?? GRADE_OPTIONS[0])
  const [period, setPeriod] = useState(initial?.period ?? '')
  const [type, setType] = useState<ProductType>(initial?.type ?? PRODUCT_TYPE_OPTIONS[2])
  const [stock, setStock] = useState(initial ? String(initial.stock) : '20')
  const [image, setImage] = useState(initial?.image ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [features, setFeatures] = useState(initial?.features.join('\n') ?? '')
  const [characterIds, setCharacterIds] = useState<string[]>(initial?.characterIds ?? [])
  const [arEnabled, setArEnabled] = useState(initial?.arEnabled ?? true)
  const [comboTag, setComboTag] = useState<'auto' | 'combo' | 'single'>(
    initial?.comboTag === undefined ? 'auto' : initial.comboTag ? 'combo' : 'single',
  )
  const [comingSoon, setComingSoon] = useState(Boolean(initial?.comingSoon))
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const payload = {
        name, subtitle,
        price: Number(price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        grade, period, type,
        stock: Number(stock) || 0,
        image, description, features, characterIds, arEnabled,
        comboTag: comboTag === 'auto' ? undefined : comboTag === 'combo',
        comingSoon,
      }
      if (initial) {
        await sendAdmin<{ product: Product }>(`/api/admin/products/${initial.id}`, 'PUT', payload)
        setSuccess(true)
        setMessage('Đã cập nhật sản phẩm thành công.')
      } else {
        await sendAdmin<{ product: Product }>('/api/admin/products', 'POST', payload)
        setSuccess(true)
        setMessage('Đã thêm sản phẩm mới thành công. Sản phẩm đã xuất hiện ở trang Sản phẩm.')
      }
      onSaved()
    } catch (error) {
      setSuccess(false)
      setMessage(error instanceof Error ? error.message : 'Không thể lưu sản phẩm.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-content-form" onSubmit={handleSubmit}>
      <button type="button" className="admin-back-link admin-back-link-btn" onClick={onCancel}>
        <ChevronLeft size={16} /> Quay lại danh sách sản phẩm
      </button>

      <FormSection icon={<PackagePlus size={18} />} title="Thông tin sản phẩm" description="Tên, mô tả và phân loại sản phẩm.">
        <div className="admin-form-grid admin-form-grid-2">
          <label className="admin-form-field admin-form-field-full">
            Tên sản phẩm
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Bộ thẻ bài Chibi lớp 8" required />
          </label>
          <label className="admin-form-field admin-form-field-full">
            Mô tả ngắn (subtitle)
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Câu mô tả ngắn hiển thị dưới tên sản phẩm" />
          </label>
          <label className="admin-form-field">
            Khối lớp
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="admin-form-field">
            Thời kỳ lịch sử
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="VD: Tổng hợp" />
          </label>
          <label className="admin-form-field">
            Loại nhân vật đại diện
            <select value={type} onChange={(e) => setType(e.target.value as ProductType)}>
              {PRODUCT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="admin-form-field">
            Nhãn Combo / Thẻ lẻ
            <select value={comboTag} onChange={(e) => setComboTag(e.target.value as typeof comboTag)}>
              <option value="auto">Tự động (theo số nhân vật)</option>
              <option value="combo">Luôn hiện "Combo"</option>
              <option value="single">Luôn hiện "Thẻ lẻ"</option>
            </select>
          </label>
        </div>
      </FormSection>

      <FormSection icon={<Tags size={18} />} title="Giá bán & tồn kho">
        <div className="admin-form-grid admin-form-grid-3">
          <label className="admin-form-field">
            Giá bán (đ)
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} disabled={comingSoon} placeholder="299000" />
          </label>
          <label className="admin-form-field">
            Giá gốc trước giảm (tuỳ chọn)
            <input type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} disabled={comingSoon} placeholder="330000" />
          </label>
          <label className="admin-form-field">
            Tồn kho
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} disabled={comingSoon} />
          </label>
        </div>
        {comingSoon ? (
          <p className="admin-form-hint admin-form-hint-block">Giá và tồn kho sẽ bị bỏ qua vì sản phẩm đang ở trạng thái "Sắp ra mắt".</p>
        ) : null}
      </FormSection>

      <FormSection icon={<ImageIcon size={18} />} title="Hình ảnh & mô tả chi tiết">
        <div className="admin-form-grid admin-form-grid-2">
          <div className="admin-form-field admin-form-field-full">
  <span>Ảnh sản phẩm</span>
  <ImageUploadField value={image} onChange={setImage} />
</div>
          <label className="admin-form-field admin-form-field-full">
            Mô tả chi tiết
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </label>
          <label className="admin-form-field admin-form-field-full">
            Tính năng nổi bật
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3} placeholder={'Mỗi dòng 1 tính năng'} />
          </label>
        </div>
      </FormSection>

      <FormSection icon={<Users size={18} />} title="Nhân vật trong sản phẩm">
        <CharacterCheckboxList selectedIds={characterIds} onChange={setCharacterIds} />
      </FormSection>

      <FormSection icon={<PackagePlus size={18} />} title="Tuỳ chọn hiển thị">
        <div className="admin-toggle-row">
          <label className="admin-toggle-card">
            <input type="checkbox" checked={arEnabled} onChange={(e) => setArEnabled(e.target.checked)} />
            <div>
              <strong>Hỗ trợ chế độ AR</strong>
              <span>Bật tính năng trải nghiệm AR cho sản phẩm này.</span>
            </div>
          </label>
          <label className="admin-toggle-card">
            <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} />
            <div>
              <strong>Sản phẩm "Sắp ra mắt"</strong>
              <span>Ẩn giá bán, khoá nút mua, chỉ hiển thị nhãn Sắp ra mắt.</span>
            </div>
          </label>
        </div>
      </FormSection>

      <div className="admin-content-form-footer">
        <button className="primary-btn" type="submit" disabled={submitting}>
          <PackagePlus size={16} />
          {submitting ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm sản phẩm mới'}
        </button>
        {message ? <p className={`status-message ${success ? 'info' : 'error'} compact`}>{message}</p> : null}
      </div>
    </form>
  )
}

// ---------- QUẢN LÝ BÀI HỌC: danh sách + thêm/sửa ----------
function LessonsManager() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<{ mode: 'list' } | { mode: 'new' } | { mode: 'edit'; lesson: Lesson }>({ mode: 'list' })

  async function loadLessons() {
    setLoading(true)
    setError('')
    try {
      const data = await getAdmin<{ lessons: Lesson[] }>('/api/admin/content/lessons')
      setLessons(data.lessons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách bài học.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLessons()
  }, [])

  if (view.mode === 'new') {
    return <LessonForm onCancel={() => setView({ mode: 'list' })} onSaved={() => { setView({ mode: 'list' }); loadLessons() }} />
  }
  if (view.mode === 'edit') {
    return <LessonForm initial={view.lesson} onCancel={() => setView({ mode: 'list' })} onSaved={() => { setView({ mode: 'list' }); loadLessons() }} />
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = lessons.filter(
    (lesson) => !normalizedQuery || lesson.title.toLowerCase().includes(normalizedQuery) || lesson.grade.toLowerCase().includes(normalizedQuery),
  )

  return (
    <div className="admin-content-list-wrap">
      <div className="admin-content-list-toolbar">
        <label className="admin-search">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tiêu đề hoặc khối lớp..." />
        </label>
        <button type="button" className="primary-btn" onClick={() => setView({ mode: 'new' })}>
          <BookPlus size={16} /> Thêm bài học mới
        </button>
      </div>

      {error ? <p className="status-message error">{error}</p> : null}
      {loading ? (
        <p className="status-message info">Đang tải danh sách bài học...</p>
      ) : (
        <div className="admin-data-card">
          <div className="admin-table admin-content-list-table admin-lessons-table">
            <div className="admin-table-row admin-table-head">
              <span>Tiêu đề</span>
              <span>Khối lớp</span>
              <span>Thời kỳ</span>
              <span>Thao tác</span>
            </div>
            {filtered.map((lesson) => (
              <div key={lesson.id} className="admin-table-row">
                <strong>{lesson.title}</strong>
                <span>{lesson.grade}</span>
                <span>{lesson.period || '—'}</span>
                <button type="button" className="admin-edit-btn" onClick={() => setView({ mode: 'edit', lesson })}>
                  <Pencil size={14} /> Sửa
                </button>
              </div>
            ))}
            {!filtered.length ? <p className="admin-empty">Không tìm thấy bài học phù hợp.</p> : null}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- QUẢN LÝ SẢN PHẨM: danh sách + thêm/sửa ----------
function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<{ mode: 'list' } | { mode: 'new' } | { mode: 'edit'; product: Product }>({ mode: 'list' })

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const data = await getAdmin<{ products: Product[] }>('/api/admin/content/products')
      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (view.mode === 'new') {
    return <ProductForm onCancel={() => setView({ mode: 'list' })} onSaved={() => { setView({ mode: 'list' }); loadProducts() }} />
  }
  if (view.mode === 'edit') {
    return <ProductForm initial={view.product} onCancel={() => setView({ mode: 'list' })} onSaved={() => { setView({ mode: 'list' }); loadProducts() }} />
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = products.filter(
    (product) => !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery) || product.grade.toLowerCase().includes(normalizedQuery),
  )

  return (
    <div className="admin-content-list-wrap">
      <div className="admin-content-list-toolbar">
        <label className="admin-search">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên hoặc khối lớp..." />
        </label>
        <button type="button" className="primary-btn" onClick={() => setView({ mode: 'new' })}>
          <PackagePlus size={16} /> Thêm sản phẩm mới
        </button>
      </div>

      {error ? <p className="status-message error">{error}</p> : null}
      {loading ? (
        <p className="status-message info">Đang tải danh sách sản phẩm...</p>
      ) : (
        <div className="admin-data-card">
          <div className="admin-table admin-content-list-table admin-products-table">
            <div className="admin-table-row admin-table-head">
              <span>Tên sản phẩm</span>
              <span>Khối lớp</span>
              <span>Giá bán</span>
              <span>Tồn kho</span>
              <span>Thao tác</span>
            </div>
            {filtered.map((product) => (
              <div key={product.id} className="admin-table-row">
                <strong>{product.name}</strong>
                <span>{product.grade}</span>
                <span>{product.comingSoon ? 'Sắp ra mắt' : formatCurrency(product.price)}</span>
                <span>{product.comingSoon ? '—' : product.stock}</span>
                <button type="button" className="admin-edit-btn" onClick={() => setView({ mode: 'edit', product })}>
                  <Pencil size={14} /> Sửa
                </button>
              </div>
            ))}
            {!filtered.length ? <p className="admin-empty">Không tìm thấy sản phẩm phù hợp.</p> : null}
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminContentManager() {
  const [tab, setTab] = useState<'lesson' | 'product'>('lesson')

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow dark">Nội dung</p>
          <h2>Quản lý bài học & sản phẩm</h2>
          <p>Thêm mới hoặc chỉnh sửa bài học/sản phẩm đang có. Thay đổi được áp dụng ngay cho người dùng.</p>
        </div>
      </div>

      <div className="auth-switch-row admin-content-tabs">
        <button type="button" className={`auth-switch ${tab === 'lesson' ? 'active' : ''}`} onClick={() => setTab('lesson')}>
          <BookPlus size={15} /> Bài học
        </button>
        <button type="button" className={`auth-switch ${tab === 'product' ? 'active' : ''}`} onClick={() => setTab('product')}>
          <PackagePlus size={15} /> Sản phẩm
        </button>
      </div>

      {tab === 'lesson' ? <LessonsManager /> : <ProductsManager />}
    </div>
  )
}