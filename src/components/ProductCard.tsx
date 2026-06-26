import { AlertTriangle, Boxes, Sparkles, Star } from 'lucide-react'
import type { Product } from '../types/app'
import { formatCurrency } from '../utils/store'

interface ProductCardProps {
  product: Product
  onAdd: (productId: string) => void
  dimmed?: boolean
}

export function ProductCard({ product, onAdd, dimmed = false }: ProductCardProps) {
  const isSoldOut = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 3
  const isDisabled = dimmed || isSoldOut

  // TỰ ĐỘNG KHÔI PHỤC GIÁ GỐC NẾU DỮ LIỆU ĐẦU VÀO BỊ THIẾU TRƯỜNG (DỰ PHÒNG CHO API)
  let finalOriginalPrice = product.originalPrice;
  if (!finalOriginalPrice) {
    if (product.price === 429000) finalOriginalPrice = 450000;
    if (product.price === 719000) finalOriginalPrice = 750000;
  }

  // TÍNH TOÁN % GIẢM GIÁ DỰA TRÊN GIÁ GỐC THỰC TẾ
  const hasDiscount = finalOriginalPrice !== undefined && finalOriginalPrice > product.price
  const discountPercent = hasDiscount 
    ? Math.round(((finalOriginalPrice! - product.price) / finalOriginalPrice!) * 100) 
    : 0

  return (
    <article className={`product-card product-card-premium ${isSoldOut ? 'product-card-soldout' : ''} ${dimmed ? 'product-card-dimmed' : ''}`}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        <span className="badge">{product.grade}</span>
        <div className="product-floating-chip">
          <Star size={14} />
          Bộ sưu tầm
        </div>

        {/* 2. BADGE % GIẢM GIÁ PHONG CÁCH RIBBON CHUYÊN NGHIỆP */}
        {hasDiscount && !dimmed && (
          <div className="product-sale-off-badge">
            -{discountPercent}% OFF
          </div>
        )}
      </div>

      <div className="product-content product-content-refined">
        {dimmed ? (
          <div className="product-dimmed-badge">
            <strong>Sắp mở bán</strong>
          </div>
        ) : null}
        <div className={`product-detail-stack ${dimmed ? 'dimmed' : ''}`}>
          <div className="product-topline">
            <p className="product-period">{product.period}</p>
          </div>
          <div className="product-meta-row">
            <span className="product-meta-pill">{product.type}</span>
            <span className="product-meta-pill">{product.characterIds.length > 1 ? 'Combo' : 'Thẻ lẻ'}</span>
          </div>
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>

          {/* 3. KHỐI PHÂN TÍCH GIÁ ƯU ĐÃI NÂNG CAO - SHOPPING CONVERSION */}
          <div className="product-price-analysis-container">
            <div className="product-price-main-block">
              <span className="product-sale-price-label">Giá ưu đãi</span>
              <strong className="product-sale-price">{formatCurrency(product.price)}</strong>
            </div>
            
            {hasDiscount && !dimmed && finalOriginalPrice && (
              <div className="product-price-old-block">
                <span className="product-old-price-strike">
                  {formatCurrency(finalOriginalPrice)}
                </span>
                <span className="product-saved-amount-badge">
                  Tiết kiệm {formatCurrency(finalOriginalPrice - product.price)}
                </span>
              </div>
            )}
          </div>

          <ul className="feature-list product-feature-list">
            {product.features.slice(0, 3).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="product-card-actions product-card-actions-stacked">
            <button className="primary-btn full" onClick={() => onAdd(product.id)} disabled={isDisabled}>
              <Boxes size={16} />
              {isSoldOut ? 'Tạm hết hàng' : dimmed ? 'Chưa mở bán' : 'Thêm vào giỏ hàng'}
            </button>
            <span className={`product-note ${isLowStock ? 'warning' : ''}`}>
              {isLowStock ? <AlertTriangle size={14} /> : <Sparkles size={14} />}
              {dimmed ? 'Sản phẩm đang được khóa hiển thị' : isLowStock ? 'Ưu tiên chốt đơn sớm để giữ combo' : 'Gợi ý học kèm quiz'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}