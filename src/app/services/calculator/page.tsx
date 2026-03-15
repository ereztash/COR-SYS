'use client'

import { useState } from 'react'
import Link from 'next/link'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

export default function CalculatorPage() {
  const [managers, setManagers] = useState(5)
  const [hoursPerWeek, setHoursPerWeek] = useState(15)
  const [monthlySalary, setMonthlySalary] = useState(35000)

  const hourlyRate = monthlySalary / 160
  const weeklyWaste = managers * hoursPerWeek * hourlyRate
  const annualWaste = weeklyWaste * 52
  const capacityLost = Math.min((hoursPerWeek / 40) * 100, 100)
  const jQuotient = Math.max((40 - hoursPerWeek) / 40, 0)

  const severity =
    hoursPerWeek > 15
      ? { label: 'קריטי — דימום קוגניטיבי', color: 'text-red-400', border: 'border-t-red-500', dot: 'bg-red-500' }
      : hoursPerWeek >= 5
      ? { label: 'גבוה — חוב החלטות מצטבר', color: 'text-yellow-400', border: 'border-t-yellow-400', dot: 'bg-yellow-400' }
      : { label: 'נמוך — תפקוד תקין', color: 'text-emerald-400', border: 'border-t-emerald-500', dot: 'bg-emerald-500' }

  const jColor = jQuotient < 0.35 ? 'text-red-400' : jQuotient < 0.6 ? 'text-yellow-400' : 'text-emerald-400'

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/services" className="text-slate-400 hover:text-white text-sm transition-colors">← שירותים</Link>
        <h1 className="text-2xl font-black text-white mt-2">מחשבון Decision Latency</h1>
        <p className="text-slate-400 text-sm mt-1">כמת את ההפסד הכלכלי משהיית החלטות — לפי מודל COR-SYS</p>

        {/* Inputs */}
        <div className="mt-8 bento-card p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase">נתוני קלט</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              מספר מנהלים בצוות הניהול
              <span className="text-blue-400 font-bold ml-2">{managers}</span>
            </label>
            <input
              type="range"
              min={1} max={50} value={managers}
              onChange={(e) => setManagers(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>1</span><span>25</span><span>50</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              שעות אבודות בשבוע — למנהל
              <span className={`font-bold ml-2 ${severity.color}`}>{hoursPerWeek} שעות</span>
            </label>
            <input
              type="range"
              min={1} max={40} value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>1</span>
              <span className="text-emerald-600">סף 5</span>
              <span className="text-red-600">סף 15</span>
              <span>40</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              שכר חודשי ממוצע למנהל (₪)
            </label>
            <input
              type="number"
              min={10000} max={200000} step={1000}
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className={`mt-5 bento-card p-6 border-t-4 ${severity.border} space-y-5`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${severity.dot}`} />
            <span className={`text-sm font-bold ${severity.color}`}>{severity.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">הפסד שנתי</p>
              <p className="text-2xl font-black text-white">{formatILS(annualWaste)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{formatILS(weeklyWaste)} / שבוע</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">קיבולת אבודה</p>
              <p className="text-2xl font-black text-white">{capacityLost.toFixed(0)}%</p>
              <p className="text-[10px] text-slate-500 mt-0.5">מסך הקיבולת הקוגניטיבית</p>
            </div>
          </div>

          {/* J Quotient */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold">J-Quotient: C(t) / E(t)</span>
              <span className={`font-bold ${jColor}`}>{jQuotient.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${jQuotient < 0.35 ? 'bg-red-500' : jQuotient < 0.6 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                style={{ width: `${jQuotient * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
              <span>0 — קריסה</span>
              <span className="text-red-600">0.35 סף</span>
              <span>1 — בריאות מלאה</span>
            </div>
          </div>

          {/* CTA */}
          {hoursPerWeek > 15 && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40">
              <p className="text-sm font-bold text-red-300 mb-1">דימום קוגניטיבי חמור</p>
              <p className="text-xs text-red-400/80 leading-relaxed">
                מעל 15 שעות שבועיות אבודות = E {'>'} 65% מ-C(t). הארגון נמצא מתחת לסף קריסה לא-ליניארית. ספרינט חוסם עורקים (14 יום) מומלץ לפני כל יוזמה אחרת.
              </p>
            </div>
          )}
          {hoursPerWeek >= 5 && hoursPerWeek <= 15 && (
            <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-800/30">
              <p className="text-sm font-bold text-yellow-300 mb-1">חוב החלטות מצטבר</p>
              <p className="text-xs text-yellow-400/80 leading-relaxed">
                בין 5 ל-15 שעות שבועיות — אנטרופיה מצטברת. מומלץ לבצע אבחון מלא דרך שאלון COR-SYS לזיהוי הפתולוגיות הספציפיות.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              href="/clients"
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
            >
              שאלון COR-SYS ← לקוח
            </Link>
            <Link
              href="/services"
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← שירותים
            </Link>
          </div>
        </div>

        <p className="mt-6 text-[10px] text-slate-600 leading-relaxed">
          חישוב: שכר שעתי = שכר חודשי ÷ 160 שעות. הפסד שנתי = מנהלים × שעות/שבוע × שכר שעתי × 52 שבועות.
          J-Quotient = (40 − שעות_אבודות) ÷ 40. סף קריסה: J {'<'} 0.35 ≡ E {'>'} 65% מ-C(t).
        </p>
      </div>
    </div>
  )
}
