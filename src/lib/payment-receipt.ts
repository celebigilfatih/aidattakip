export type ReceiptContext =
  | { kind: 'collection'; collectedAmount: number }
  | { kind: 'summary' }

// payment.paidAmount is the persisted total AFTER a collection, never the prior total.
// Reopening a payment cannot reconstruct individual collections from the current model.
export function receiptAmounts(payment: { amount: number; paidAmount?: number | null }, context: ReceiptContext) {
  const totalPaid = payment.paidAmount ?? 0
  const remaining = Math.max(payment.amount - totalPaid, 0)
  return {
    totalPaid,
    remaining,
    previousPaid: context.kind === 'collection' ? Math.max(totalPaid - context.collectedAmount, 0) : null,
    collected: context.kind === 'collection' ? context.collectedAmount : null,
    status: remaining > 0 ? 'KISMİ ÖDEME' : 'ÖDENDİ',
  }
}
