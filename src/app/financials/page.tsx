import { getFinancials, getClientsForSelect } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'
import { YEAR_1_REVENUE_TARGET } from '@/lib/business-config'
import Link from 'next/link'
import { AddFinancialForm } from './AddFinancialForm'
import { ModeBlurb } from '@/components/ui/ModeBlurb'

export const dynamic = 'force-dynamic'

export default async function FinancialsPage() {
  const [financials, clients] = await Promise.all([
    getFinancials(),
    getClientsForSelect(),
  ])

  const totalRevenue = financials.reduce((s, f) => s + (f.revenue ?? 0), 0)
  const paidRevenue = financials.filter(f => f.paid_date).reduce((s, f) => s + (f.revenue ?? 0), 0)
  const unpaidRevenue = totalRevenue - paidRevenue

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const revenueThisMonth = financials
    .filter(f => f.period_month.startsWith(thisMonth))
    .reduce((s, f) => s + (f.revenue ?? 0), 0)

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">כספים & P&L</h1>
          <p className="text-slate-400 text-sm mt-1">מעקב הכנסות לפי לקוח וחודש</p>
          <ModeBlurb
            className="mt-2"
            beginner="המסך מראה כמה כסף נכנס, מה שולם, ומה עדיין ממתין."
            advanced="Financial tracking by client-month with paid/unpaid split and year target progress."
            research="Revenue-state ledger for value-realization monitoring across intervention cohorts."
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">סה"כ הכנסות</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">החודש</p>
            <p className="text-xl font-black text-blue-400">{formatCurrency(revenueThisMonth)}</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">שולם</p>
            <p className="text-xl font-black text-white">{formatCurrency(paidRevenue)}</p>
          </div>
          <div className="bento-card p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">ממתין</p>
            <p className="text-xl font-black text-yellow-400">{formatCurrency(unpaidRevenue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Add form */}
          <div className="bento-card p-5">
            <h2 className="text-sm font-bold text-white mb-4">הוסף רשומה</h2>
            <AddFinancialForm clients={clients} />
          </div>

          {/* Table */}
          <div className="md:col-span-2 bento-card p-5">
            <h2 className="text-sm font-bold text-white mb-4">היסטוריה</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {financials.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">אין רשומות עדיין</p>
              )}
              {financials.map(f => {
                const cl = f.clients as { name?: string; company?: string | null } | null
                return (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div>
                      <p className="text-sm font-bold text-white">{cl?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(f.period_month).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-left flex items-center gap-3">
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(f.revenue)}</p>
                      <div className="text-[10px]">
                        {f.paid_date ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">שולם ✓</span>
                        ) : f.invoiced ? (
                          <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">הוחשבן</span>
                        ) : (
                          <span className="text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">טיוטה</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Year target */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>יעד שנה 1: {formatCurrency(YEAR_1_REVENUE_TARGET)}</span>
                <span>{Math.round((totalRevenue / YEAR_1_REVENUE_TARGET) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totalRevenue / YEAR_1_REVENUE_TARGET) * 100)}%` }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
