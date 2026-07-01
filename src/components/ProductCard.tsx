import React, { useState } from 'react'
import { AlertTriangle, Boxes, Sparkles, Flame, Check } from 'lucide-react'
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

  // State điều khiển hiển thị thông báo Shopee Toast
  const [showSuccessToast, setShowSuccessToast] = useState(false)

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

  // KIỂM TRA ĐỂ CHÈN BADGE BEST SELLER (Áp dụng cho sản phẩm Thẻ lẻ / Không phải combo)
  const isBestSeller = product.characterIds.length === 1 || product.id.includes('tron-bo');

  // Hàm xử lý tương tác thêm vào giỏ và kích hoạt Toast thông báo
  const handleAddToCart = () => {
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
      <article className={`product-card product-card-premium ${isSoldOut ? 'product-card-soldout' : ''} ${dimmed ? 'product-card-dimmed' : ''}`}>
        <div className="product-image-wrap">
          <img src={product.image} alt={product.name} className="product-image" />
          <span className="badge">{product.grade}</span>
          
          {/* TAG BEST SELLER ĐẲNG CẤP THƯƠNG MẠI ĐIỆN TỬ (CHỈ HIỂN THỊ TRÊN SẢN PHẨM ĐẦU TIÊN) */}
          {isBestSeller && !dimmed && (
            <div 
              className="product-floating-chip" 
              style={{ 
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)', 
                color: '#ffffff',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(255, 77, 79, 0.35)',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}
            >
              <Flame size={13} fill="#fff" />
              Best Seller
            </div>
          )}

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

            {/* KHỐI PHÂN TÍCH GIÁ */}
            <div className="product-price-analysis-container">
              <div className="product-price-main-block">
                <span className="product-sale-price-label">Giá ưu đãi</span>
                <strong className="product-sale-price">{formatCurrency(product.price)}</strong>
              </div>
              
              {hasDiscount && !dimmed && finalOriginalPrice ? (
                <div className="product-price-old-block">
                  <span className="product-old-price-strike">
                    {formatCurrency(finalOriginalPrice)}
                  </span>
                  <span className="product-saved-amount-badge">
                    Tiết kiệm {formatCurrency(finalOriginalPrice - product.price)}
                  </span>
                </div>
              ) : (
                /* Giữ khoảng trống tịnh tiến vô hình */
                <div className="product-price-old-block empty-placeholder" style={{ opacity: 0 }}>
                  <span className="product-old-price-strike">0đ</span>
                  <span className="product-saved-amount-badge">0đ</span>
                </div>
              )}
            </div>

            <ul className="feature-list product-feature-list">
              {product.features.slice(0, 3).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {/* Khối này sẽ tự động neo chặt xuống chân của card */}
            <div className="product-card-actions product-card-actions-stacked">
              <button className="primary-btn full" onClick={handleAddToCart} disabled={isDisabled}>
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

      {/* TOAST SHOPEE POPUP */}
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