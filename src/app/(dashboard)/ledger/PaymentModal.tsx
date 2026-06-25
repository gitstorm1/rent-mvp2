'use client'

import { useState } from 'react'
import { processPayment } from './actions'

export function PaymentModal({ bill, onClose }: { bill: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const paid = bill.payments.reduce((acc: number, p: any) => acc + Number(p.amount_paid), 0)
  const balance = Number(bill.amount_due) - paid

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('bill_id', bill.id)
    
    const result = await processPayment(formData)
    
    if (result.success) {
      onClose()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Record Payment</h3>
        <div className="mb-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
          <p><strong>Tenant:</strong> {bill.tenants.name}</p>
          <p><strong>Bill Type:</strong> {bill.bill_type}</p>
          <p><strong>Total Due:</strong> ${Number(bill.amount_due).toFixed(2)}</p>
          <p><strong>Remaining Balance:</strong> ${balance.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select required name="status" defaultValue={bill.status} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
            <input required name="amount_paid" type="number" step="0.01" max={balance} defaultValue={balance.toFixed(2)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900" />
            <p className="text-xs text-slate-500 mt-1">This will be added to the total collected payments for this bill.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot Proof (Optional)</label>
            <input name="screenshot" type="file" accept="image/*" className="w-full text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
