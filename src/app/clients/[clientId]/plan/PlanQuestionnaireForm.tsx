'use client'

import { useState } from 'react'
import { QUESTIONNAIRE_STEPS, type QuestionnaireAnswer, type DynamicSummary, buildPlanFromQuestionnaire } from '@/lib/corsys-questionnaire'
import { savePlanFromQuestionnaire } from '@/lib/actions/plans'

export function PlanQuestionnaireForm({
  clientId,
  clientName,
}: { clientId: string; clientName: string }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswer>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<DynamicSummary | null>(null)

  const currentStep = QUESTIONNAIRE_STEPS[step]
  const isLast = step === QUESTIONNAIRE_STEPS.length - 1

  const set = (key: keyof QuestionnaireAnswer, value: unknown) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setError(null)
    setPreview(null)
  }

  const handlePreview = () => {
    const result = buildPlanFromQuestionnaire(clientName, answers)
    setPreview(result.dynamicSummary)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    const res = await savePlanFromQuestionnaire(clientId, clientName, answers)
    setSaving(false)
    if (res.ok) {
      window.location.reload()
    } else {
      setError(res.error ?? 'שגיאה בשמירה')
    }
  }

  return (
    <div className="space-y-6">
      {/* Step tabs */}
      <div className="flex gap-2 mb-4">
        {QUESTIONNAIRE_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              step === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Current step fields */}
      <div className="bento-card p-6 border-t-4 border-t-emerald-500">
        <h3 className="text-lg font-bold text-white mb-4">{currentStep.title}</h3>
        <div className="space-y-5">
          {currentStep.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {f.label}
                {f.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {f.type === 'select' && (
                <div className="space-y-2">
                  {f.options?.map((o) => (
                    <label
                      key={o.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[f.key as keyof QuestionnaireAnswer] === o.value
                          ? 'border-blue-500 bg-blue-950/40 text-white'
                          : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={f.key}
                        value={o.value}
                        checked={answers[f.key as keyof QuestionnaireAnswer] === o.value}
                        onChange={() => set(f.key as keyof QuestionnaireAnswer, o.value)}
                        className="mt-0.5 shrink-0 accent-blue-500"
                      />
                      <span className="text-sm leading-snug">{o.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic preview (last step only) */}
      {isLast && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 text-sm transition-colors"
          >
            תצוגה מקדימה של האבחון
          </button>
          {preview && (
            <div className="bento-card p-5 space-y-4 border-t-4 border-t-cyan-500">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">תצוגה מקדימה — אבחון דינמי</h4>
              {preview.roleParagraph && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">תפקיד ושלב ארגוני</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{preview.roleParagraph}</p>
                </div>
              )}
              {preview.diagnosisParagraph && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">אבחון פתולוגיות</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{preview.diagnosisParagraph}</p>
                </div>
              )}
              {preview.ctaParagraph && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">המלצה אופרטיבית</p>
                  <p className="text-sm text-emerald-300 leading-relaxed font-medium">{preview.ctaParagraph}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white disabled:opacity-50 text-sm"
        >
          ← הקודם
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'בנה תוכנית עסקית'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
          >
            הבא →
          </button>
        )}
      </div>
    </div>
  )
}
