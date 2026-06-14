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
  const stockLabel = isSoldOut ? 'Tạm hết hàng' : isLowStock ? `Sắp hết · còn ${product.stock}` : `Còn ${product.stock}`

  return (
    <article className={`product-card product-card-premium ${isSoldOut ? 'product-card-soldout' : ''} ${dimmed ? 'product-card-dimmed' : ''}`}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        <span className="badge">{product.grade}</span>
        <div className="product-floating-chip">
          <Star size={14} />
          Bộ sưu tầm
        </div>
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
            <span className={`product-stock ${isSoldOut ? 'soldout' : isLowStock ? 'low' : 'ready'}`}>{stockLabel}</span>
          </div>
          <div className="product-meta-row">
            <span className="product-meta-pill">{product.type}</span>
            <span className="product-meta-pill">{product.characterIds.length > 1 ? 'Combo' : 'Thẻ lẻ'}</span>
          </div>
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>
          <div className="product-price-row">
            <strong>{formatCurrency(product.price)}</strong>
            {product.originalPrice ? <span>{formatCurrency(product.originalPrice)}</span> : null}
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
