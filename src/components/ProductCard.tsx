import { useState } from 'react'
import { Boxes, Check, Clock } from 'lucide-react'
import type { Product } from '../types/app'
import { formatCurrency } from '../utils/store'

interface ProductCardProps {
  product: Product
  onAdd: (productId: string) => void
  dimmed?: boolean
}

export function ProductCard({ product, onAdd, dimmed = false }: ProductCardProps) {
  // Danh sách cố định các sản phẩm được gắn nhãn "Bán chạy" / "Mới" — xác định theo đúng id,
  // không suy đoán qua số lượng nhân vật (vì combo và bộ lẻ đều có thể có nhiều/ít nhân vật khác nhau).
  const BEST_SELLER_PRODUCT_IDS = ['combo-lop-6', 'combo-lop-6-3-bo']
  const NEW_PRODUCT_IDS = ['combo-lop-6-5-bo', 'combo-lop-6-chibi', 'combo-lop-6-thuong-chibi']
  const isComingSoon = Boolean(product.comingSoon)
  const isSoldOut = product.stock <= 0
  const isDisabled = dimmed || isSoldOut || isComingSoon

  const [showSuccessToast, setShowSuccessToast] = useState(false)

  let finalOriginalPrice = product.originalPrice
  if (!finalOriginalPrice) {
    if (product.price === 429000) finalOriginalPrice = 450000
    if (product.price === 719000) finalOriginalPrice = 750000
  }

  const hasDiscount = !isComingSoon && finalOriginalPrice !== undefined && finalOriginalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((finalOriginalPrice! - product.price) / finalOriginalPrice!) * 100)
    : 0

  const isBestSeller = !isComingSoon && BEST_SELLER_PRODUCT_IDS.includes(product.id)
  const isNew = !isComingSoon && !isBestSeller && NEW_PRODUCT_IDS.includes(product.id)

  const isCombo = product.comboTag !== undefined ? product.comboTag : product.characterIds.length > 1

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isDisabled) return
    onAdd(product.id)
    setShowSuccessToast(true)

    const cartIcon = document.getElementById('cart-icon')
    if (cartIcon) {
      cartIcon.classList.add('bounce-active')
      setTimeout(() => cartIcon.classList.remove('bounce-active'), 400)
    }

    setTimeout(() => {
      setShowSuccessToast(false)
    }, 2000)
  }

  return (
    <>
      <article className={`product-card product-card-simple ${isSoldOut ? 'product-card-soldout' : ''} ${dimmed ? 'product-card-dimmed' : ''} ${isComingSoon ? 'product-card-coming-soon' : ''}`}>
        <div className="product-image-wrap product-image-wrap-simple">
          <img src={product.image} alt={product.name} className="product-image" />

          {isComingSoon ? (
            <span className="product-simple-ribbon product-simple-ribbon-soon">
              <Clock size={12} />
              Sắp ra mắt
            </span>
          ) : isBestSeller ? (
            <span className="product-simple-ribbon product-simple-ribbon-bestseller">Bán chạy</span>
          ) : isNew ? (
            <span className="product-simple-ribbon product-simple-ribbon-new">Mới</span>
          ) : null}

          <button
            type="button"
            className="product-simple-hover-cta"
            onClick={handleAddToCart}
            disabled={isDisabled}
          >
            <Boxes size={16} />
            {isComingSoon ? 'Sắp ra mắt' : isSoldOut ? 'Tạm hết hàng' : dimmed ? 'Chưa mở bán' : 'Thêm vào giỏ hàng'}
          </button>
        </div>

        <div className="product-content product-content-simple">
          <span className="product-simple-grade">
            {product.grade}
            {isCombo && !isComingSoon ? ' · Combo' : ''}
          </span>
          <h3 className="product-simple-title">{product.name}</h3>

          <div className="product-simple-price-row">
            {isComingSoon ? (
              <strong className="product-simple-price product-simple-price-soon">Sắp ra mắt</strong>
            ) : (
              <>
                <strong className="product-simple-price">{formatCurrency(product.price)}</strong>
                {hasDiscount && finalOriginalPrice ? (
                  <>
                    <span className="product-simple-discount-badge">-{discountPercent}%</span>
                    <span className="product-simple-old-price">{formatCurrency(finalOriginalPrice)}</span>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>
      </article>

      {showSuccessToast && (
        <div className="shopee-toast-overlay">
          <div className="shopee-toast-box">
            <div className="shopee-toast-icon-circle">
              <Check size={32} strokeWidth={3} />
            </div>
            <p className="shopee-toast-text">Sản phẩm đã được thêm vào Giỏ hàng</p>
          </div>
        </div>
      )}
    </>
  )
}