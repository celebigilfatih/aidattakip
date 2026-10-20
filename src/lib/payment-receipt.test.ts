import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { receiptAmounts, type ReceiptContext } from './payment-receipt'
import { PaymentReceipt } from '../components/PaymentReceipt'
import type { Payment } from '../types'

test('first partial collection subtracts the post-save total only once', () => {
  assert.deepEqual(receiptAmounts({ amount: 1500, paidAmount: 500 }, { kind: 'collection', collectedAmount: 500 }), {
    totalPaid: 500, previousPaid: 0, collected: 500, remaining: 1000, status: 'KISMİ ÖDEME',
  })
})

test('later partial and final collections separate prior payments from this receipt', () => {
  assert.deepEqual(receiptAmounts({ amount: 1500, paidAmount: 800 }, { kind: 'collection', collectedAmount: 300 }), {
    totalPaid: 800, previousPaid: 500, collected: 300, remaining: 700, status: 'KISMİ ÖDEME',
  })
  assert.deepEqual(receiptAmounts({ amount: 1500, paidAmount: 1500 }, { kind: 'collection', collectedAmount: 700 }), {
    totalPaid: 1500, previousPaid: 800, collected: 700, remaining: 0, status: 'ÖDENDİ',
  })
})

test('reopening is a cumulative summary without invented prior or latest collection amounts', () => {
  const payment = { amount: 1500, paidAmount: 800 }
  const expected = { totalPaid: 800, previousPaid: null, collected: null, remaining: 700, status: 'KISMİ ÖDEME' }
  assert.deepEqual(receiptAmounts(payment, { kind: 'summary' }), expected)
  assert.deepEqual(receiptAmounts(payment, { kind: 'summary' }), expected)
  assert.deepEqual(payment, { amount: 1500, paidAmount: 800 })
})

test('missing paid total is not replaced with the debt; overpayment never produces negative remaining', () => {
  assert.equal(receiptAmounts({ amount: 1500, paidAmount: null }, { kind: 'summary' }).totalPaid, 0)
  assert.equal(receiptAmounts({ amount: 1500 }, { kind: 'summary' }).remaining, 1500)
  assert.equal(receiptAmounts({ amount: 1500, paidAmount: 1600 }, { kind: 'summary' }).remaining, 0)
})

function document(paymentTotal: number, context: ReceiptContext) {
  const payment = { id: 'receipt-fixture', amount: 1500, paidAmount: paymentTotal, dueDate: new Date('2027-01-31T00:00:00+03:00'), student: { firstName: 'Test', lastName: 'Sporcu' }, feeType: { name: 'Aidat' } } as Payment
  return renderToStaticMarkup(React.createElement(PaymentReceipt, { payment, context, paymentMethod: 'CASH', paidDate: '2026-10-20', onClose() {} }))
}
const currency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
const text = (html: string) => html.replace(/<[^>]*>/g, '')

test('actual receipt markup shows zero prior, this collection and correct remaining on first partial payment', () => {
  const html = text(document(500, { kind: 'collection', collectedAmount: 500 }))
  assert.ok(html.includes(`Önceden Ödenen:${currency(0)}`))
  assert.ok(html.includes(`Tahsil Edilen Tutar:${currency(500)}KISMİ ÖDEME`))
  assert.ok(html.includes(`Toplam Ödenen:${currency(500)}`))
  assert.ok(html.includes(`Kalan Bakiye:${currency(1000)}`))
  assert.ok(!html.includes('ÖDENDİ'))
})

test('actual receipt markup retains prior payments on later collection and shows zero remaining on settlement', () => {
  const partial = text(document(800, { kind: 'collection', collectedAmount: 300 }))
  assert.ok(partial.includes(`Önceden Ödenen:${currency(500)}`))
  assert.ok(partial.includes(`Kalan Bakiye:${currency(700)}`))
  const full = text(document(1500, { kind: 'collection', collectedAmount: 700 }))
  assert.ok(full.includes(`Önceden Ödenen:${currency(800)}`))
  assert.ok(full.includes(`Tahsil Edilen Tutar:${currency(700)}ÖDENDİ`))
  assert.ok(full.includes(`Kalan Bakiye:${currency(0)}`))
})

test('actual reopened document presents a summary for partial and settled payments', () => {
  for (const paid of [500, 1500]) {
    const html = text(document(paid, { kind: 'summary' }))
    assert.ok(html.includes('Ödeme Özeti'))
    assert.ok(html.includes(`Toplam Ödenen:${currency(paid)}`))
    assert.ok(html.includes(`Kalan Bakiye:${currency(1500 - paid)}`))
    assert.ok(!html.includes('Önceden Ödenen:'))
    assert.ok(!html.includes('Tahsil Edilen Tutar:'))
    assert.ok(html.includes('Ayrı tahsilatların geçmişini göstermez.'))
  }
})
