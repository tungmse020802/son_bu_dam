import React, { useState } from 'react'
import { Boxes, Check } from 'lucide-react'
import type { Product } from '../types/app'
import { formatCurrency } from '../utils/store'

interface ProductCardProps {
  product: Product
  onAdd: (productId: string) => void
  dimmed?: boolean
}

export function ProductCard({ product, onAdd, dimmed = false }: ProductCardProps) {
  const isSoldOut = product.stock <= 0
  const isDisabled = dimmed || isSoldOut
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  let finalOriginalPrice = product.originalPrice;
  if (!finalOriginalPrice) {
    if (product.price === 429000) finalOriginalPrice = 450000;
    if (product.price === 719000) finalOriginalPrice = 750000;
  }

  const hasDiscount = finalOriginalPrice !== undefined && finalOriginalPrice > product.price
  const discountPercent = hasDiscount 
    ? Math.round(((finalOriginalPrice! - product.price) / finalOriginalPrice!) * 100) 
    : 0

  const productNameLower = product.name.toLowerCase();
  const isSingleSet = productNameLower.includes('trọn bộ') || productNameLower.includes('thẻ lẻ');
  const isCombo = !isSingleSet && (product.characterIds.length > 1 || productNameLower.includes('combo'));

  // Lấy giá trị trường tag động ra
  const customBadgeText = (product as any).tag;

  let badgeColorClass = 'badge-red'; 
  if (customBadgeText === 'MỚI' || customBadgeText === 'NEW') {
    badgeColorClass = 'badge-blue';
  } else if (customBadgeText === 'GIẢM GIÁ' || customBadgeText === 'SALE') {
    badgeColorClass = 'badge-orange';
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
      <article className={`minimal-product-card ${isSoldOut ? 'soldout' : ''} ${dimmed ? 'dimmed' : ''}`}>
        <div className="minimal-image-container">
          <img src={product.image} alt={product.name} className="minimal-image" />
          
          {!dimmed && !isSoldOut && customBadgeText && (
            <span className={`minimal-badge ${badgeColorClass}`}>
              {customBadgeText}
            </span>
          )}
          {isSoldOut && <span className="minimal-badge badge-soldout">HẾT HÀNG</span>}

          {!isDisabled && (
            <button className="minimal-hover-add-btn" onClick={handleAddToCart}>
              <Boxes size={14} />
              Thêm vào giỏ hàng
            </button>
          )}
        </div>

        <div className="minimal-info-container">
          <div className="minimal-meta-row">
            <span>{product.grade}</span>
            {isCombo && (
              <>
                <span className="dot-separator">•</span>
                <span>Combo</span>
              </>
            )}
          </div>

          <h3 className="minimal-title" title={product.name}>{product.name}</h3>

          <div className="minimal-price-row">
            <span className="minimal-current-price">{formatCurrency(product.price)}</span>
            {hasDiscount && !dimmed && finalOriginalPrice && (
              <>
                <span className="minimal-inline-discount-tag">-{discountPercent}%</span>
                <span className="minimal-old-price">{formatCurrency(finalOriginalPrice)}</span>
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