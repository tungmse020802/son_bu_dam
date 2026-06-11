import type { DashboardMetric, Order } from '../types/app'
import { formatCurrency, orderStatusLabel, paymentLabel } from '../utils/store'

interface DashboardOverviewProps {
  metrics: DashboardMetric[]
  orders: Order[]
}

export function DashboardOverview({ metrics, orders }: DashboardOverviewProps) {
  return (
    <section className="dashboard-grid">
      <div className="metrics-grid metrics-grid-refined">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.change} so với tháng trước</small>
          </article>
        ))}
      </div>
      <div className="admin-panel dashboard-orders-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vận hành</p>
            <h3>Đơn hàng gần đây</h3>
          </div>
        </div>
        <div className="order-table">
          {orders.length === 0 ? (
            <p>Chưa có đơn hàng nào.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-row order-row-refined">
                <div>
                  <strong>DH-{order.orderCode}</strong>
                  <p>{order.customerName}</p>
                </div>
                <div>
                  <span>{paymentLabel(order.paymentMethod)}</span>
                  <p>{order.createdAt}</p>
                </div>
                <div>
                  <span className={`status-pill ${order.status}`}>{orderStatusLabel(order.status)}</span>
                  <p>{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
