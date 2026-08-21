import type { Order } from '@/types'
import { formatDate, formatINR } from '@/utils'

/**
 * Generates a clean, standalone, print-ready BAREO HTML Invoice Document.
 * Designed for A4 portrait export without any website chrome, headers, footers, or script tags.
 */
export function generateInvoiceHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #DCE6E9; font-weight: 500; color: #172126;">
          ${item.name}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #DCE6E9; text-align: center; color: #52636B;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #DCE6E9; text-align: right; color: #52636B;">
          ${formatINR(item.price)}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #DCE6E9; text-align: right; font-weight: 600; color: #172126;">
          ${formatINR(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('')

  const timelineHtml = (order.timeline || [])
    .map(
      (t) => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 4px;">
        <span style="color: #167C86; font-weight: bold;">✓</span>
        <strong style="color: #172126;">${t.label}</strong>
        <span style="color: #7A8A91;">— ${formatDate(t.at)}</span>
      </div>
    `
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BAREO-Invoice-${order.orderId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #172126;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #172126;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #172126;
    }
    .tagline {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #167C86;
      font-weight: 600;
      margin-top: 2px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      margin: 0;
      color: #172126;
      font-weight: 600;
    }
    .invoice-title p {
      margin: 4px 0 0 0;
      color: #7A8A91;
      font-size: 11px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      background: #FAF7F2;
      border: 1px solid #DCE6E9;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #167C86;
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #FAF7F2;
      border-bottom: 1px solid #DCE6E9;
      padding: 8px 12px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #52636B;
    }
    .totals {
      width: 280px;
      margin-left: auto;
      margin-bottom: 24px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: #52636B;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #172126;
      padding-top: 8px;
      margin-top: 6px;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: #172126;
    }
    .progress-box {
      border-top: 1px solid #DCE6E9;
      padding-top: 16px;
      margin-top: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .footer-note {
      text-align: center;
      margin-top: 32px;
      font-size: 10px;
      color: #7A8A91;
      border-top: 1px solid #DCE6E9;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">BAREO</div>
      <div class="tagline">Science for Everyday Skin.</div>
    </div>
    <div class="invoice-title">
      <h1>TAX INVOICE</h1>
      <p>Order Ref: <strong>${order.orderId}</strong></p>
      <p>Date: ${formatDate(order.placedAt)}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">SHIPPED TO</div>
      <strong style="font-size: 13px;">${order.address?.fullName || 'Customer'}</strong>
      <p style="margin: 4px 0 0 0; color: #52636B;">
        ${order.address?.line1 || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} — ${order.address?.pincode || ''}
      </p>
      ${order.address?.phone ? `<p style="margin: 2px 0 0 0; color: #7A8A91;">Mobile: ${order.address.phone}</p>` : ''}
    </div>

    <div class="card">
      <div class="card-title">PAYMENT & DISPATCH</div>
      <p style="margin: 0; color: #172126;">Method: <strong>${order.paymentMethod}</strong></p>
      <p style="margin: 2px 0 0 0; color: #167C86; font-weight: 600;">Status: ${order.paymentStatus}</p>
      <p style="margin: 2px 0 0 0; color: #52636B;">Expected Arrival: ${order.eta || '3–5 business days'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Product</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span>Subtotal</span>
      <span>${formatINR(order.subtotal)}</span>
    </div>
    ${
      order.discount > 0
        ? `
      <div class="row" style="color: #167C86;">
        <span>Product Savings</span>
        <span>− ${formatINR(order.discount)}</span>
      </div>
    `
        : ''
    }
    ${
      order.couponCode && (order.couponDiscount ?? 0) > 0
        ? `
      <div class="row" style="color: #167C86; font-weight: 600;">
        <span>Coupon (${order.couponCode})</span>
        <span>− ${formatINR(order.couponDiscount ?? 0)}</span>
      </div>
    `
        : ''
    }
    <div class="row">
      <span>Shipping</span>
      <span style="color: #167C86; font-weight: 600;">${order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
    </div>
    <div class="row">
      <span>GST</span>
      <span style="color: #167C86;">Included</span>
    </div>
    <div class="total-row">
      <span>Total Paid</span>
      <span>${formatINR(order.total)}</span>
    </div>
  </div>

  <div class="progress-box">
    <div class="card-title">ORDER FULFILLMENT TIMELINE</div>
    ${timelineHtml}
  </div>

  <div class="footer-note">
    Thank you for choosing BAREO · Dermatologist-Formulated Skincare · www.bareocosmetics.com
  </div>
</body>
</html>`
}

/**
 * Triggers a clean file download of the BAREO Invoice document as an HTML/PDF printable file.
 */
export function downloadInvoiceFile(order: Order) {
  const htmlContent = generateInvoiceHtml(order)
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `BAREO-Invoice-${order.orderId}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Opens a dedicated print window for the invoice document and triggers print.
 */
export function printInvoiceDocument(order: Order) {
  const htmlContent = generateInvoiceHtml(order)
  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
