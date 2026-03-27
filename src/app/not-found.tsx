import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm space-y-4 animate-fade-up">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <FileQuestion className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-white">הדף לא נמצא</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          הכתובת שחיפשת לא קיימת או שהועברה למקום אחר.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
        >
          חזרה לדשבורד
        </Link>
      </div>
    </div>
  )
}
