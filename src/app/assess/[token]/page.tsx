import { notFound } from 'next/navigation'
import { getAssessmentByToken } from '@/lib/data'
import { AssessmentForm } from './AssessmentForm'

export const dynamic = 'force-dynamic'

export default async function AssessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const assessment = await getAssessmentByToken(token)
  if (!assessment) notFound()
  if (assessment.status === 'completed') {
    return (
      <div className="min-h-screen bg-[#0f172a] p-6 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-bold text-white mb-2">ההערכה הושלמה</p>
          <a href={`/assess/${token}/results`} className="text-emerald-400 underline hover:no-underline">
            צפה בתוצאות →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">C</div>
          <span className="font-black text-white text-xl" style={{ fontFamily: 'Heebo, sans-serif' }}>COR-SYS</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-2">הערכת ארגון — שאלון אבחון</h1>
        <p className="text-slate-400 text-sm mt-1 mb-8">מלא את השאלון. בסיום תקבל תצוגת תוצאות (אבחון DSM, פרוטוקולי התערבות).</p>
        <AssessmentForm token={token} />
      </div>
    </div>
  )
}
