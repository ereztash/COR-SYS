'use client'

import { useMemo, useState } from 'react'
import {
  resolveQuestionnaireSteps,
  effectiveOperatingContext,
  type QuestionnaireAnswer,
  type OperatingContext,
} from '@/lib/corsys-questionnaire'
import { saveAssessmentAnswers } from '@/lib/actions/assessments'

export function AssessmentForm({
  token,
  clientOperatingContext = null,
}: {
  token: string
  clientOperatingContext?: OperatingContext | null
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswer>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ctx = effectiveOperatingContext(answers, clientOperatingContext)
  const steps = useMemo(() => {
    const base = resolveQuestionnaireSteps(ctx)
    const locked =
      clientOperatingContext === 'team' || clientOperatingContext === 'one_man_show'
    if (!locked) return base
    return base.map((step) => ({
      ...step,
      fields: step.fields.filter((f) => f.key !== 'operatingContext'),
    }))
  }, [ctx, clientOperatingContext])

  const currentStep = steps[step]
  const isLast = step === steps.length - 1

  const set = (key: keyof QuestionnaireAnswer, value: unknown) => {
    setAnswers((a) => {
      const next = { ...a, [key]: value } as QuestionnaireAnswer
      if (key === 'operatingContext') {
        next.companySize = undefined
      }
      return next
    })
    setError(null)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    const res = await saveAssessmentAnswers(token, answers)
    setSaving(false)
    if (res.ok) {
      window.location.href = `/assess/${token}/results`
    } else {
      setError(res.error ?? 'שגיאה בשמירה')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1">
        <div className="flex gap-2 flex-nowrap min-w-0">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 min-h-[44px] ${
                step === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

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
                      className={`flex items-start gap-3 p-3 py-3.5 rounded-lg border cursor-pointer transition-colors min-h-[44px] w-full ${
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
              {f.type === 'scale' && (
                <div>
                  {f.scaleLabels != null && (
                    <div className="flex justify-between text-xs text-slate-500 mb-2 px-1">
                      <span>{f.scaleLabels.min}</span>
                      <span>{f.scaleLabels.max}</span>
                    </div>
                  )}
                  <div className="flex gap-1.5 justify-between">
                    {f.options?.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set(f.key as keyof QuestionnaireAnswer, o.value)}
                        className={`flex-1 h-10 rounded-lg text-sm font-bold transition-colors border ${
                          answers[f.key as keyof QuestionnaireAnswer] === o.value
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

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
            {saving ? 'שומר...' : 'שלח ותצוגת תוצאות'}
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
