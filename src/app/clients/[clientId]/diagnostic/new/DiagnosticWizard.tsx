'use client'

import { useState, useTransition, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getDiagnosticQuestions } from '@/lib/diagnostic/questions'
import type { OperatingContext } from '@/lib/corsys-questionnaire'
import { buildEmbeddingText } from '@/lib/diagnostic/questions'
import {
  build90DayGateReviews,
  build90DayGateReviewsWithConfig,
  evaluateTriggerRules,
  evaluateTriggerRulesWithConfig,
  getDominantAxis,
  profileFromScores,
  PROFILE_LABELS,
  HORIZON_LABELS,
  PATHOLOGY_TYPE_LABELS,
  PATHOLOGY_PROTOCOL_MAP,
} from '@/lib/diagnostic/action-plan'
import { runUnifiedTreatmentPipeline } from '@/lib/diagnostic/unified-pipeline'
import { createDiagnosticSprintAction } from '@/lib/actions/diagnostic'
import type { DiagnosticAnalysisResult } from '@/app/api/diagnostic/analyze/route'
import type { DiagnosticAxis } from '@/lib/diagnostic/questions'
import type { PathologyProfile, PathologyType } from '@/lib/diagnostic/pathology-kb'
import type { ActionPlanItem, ConstraintEnvelope } from '@/lib/diagnostic/action-plan'
import type { DiagnosticRuntimeConfig } from '@/lib/diagnostic/action-plan'
import { logUxEvent } from '@/lib/ux-metrics'

// ─── Design tokens ────────────────────────────────────────────────────────────

const AXIS_CONFIG = {
  DR: {
    label: 'Decision Latency',
    label_he: 'עיכוב קבלת החלטות',
    color: 'axis-dr',
    trackColor: 'bg-red-500',
    borderColor: 'border-red-500/40',
    bgColor: 'panel-dr',
    thumbColor: '#ef4444',
  },
  ND: {
    label: 'Normalization of Deviance',
    label_he: 'נרמול סטיות',
    color: 'axis-nd',
    trackColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500/40',
    bgColor: 'panel-nd',
    thumbColor: '#eab308',
  },
  UC: {
    label: 'Calibration',
    label_he: 'כיול ריאלי',
    color: 'axis-uc',
    trackColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500/40',
    bgColor: 'panel-uc',
    thumbColor: '#6366f1',
  },
  SC: {
    label: 'Structural Clarity',
    label_he: 'בהירות מבנית',
    color: 'axis-sc',
    trackColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500/40',
    bgColor: 'panel-sc',
    thumbColor: '#818cf8',
  },
} as const

const PROFILE_STYLE: Record<PathologyProfile, { color: string; border: string; bg: string; dot: string }> = {
  healthy:            { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  'at-risk':          { color: 'text-yellow-400',  border: 'border-yellow-500/40',  bg: 'bg-yellow-500/10',  dot: 'bg-yellow-400' },
  critical:           { color: 'text-orange-400',  border: 'border-orange-500/40',  bg: 'bg-orange-500/10',  dot: 'bg-orange-400' },
  'systemic-collapse':{ color: 'text-red-400',     border: 'border-red-500/40',     bg: 'bg-red-500/10',     dot: 'bg-red-400' },
}

// Comorbidity cascade from DSM-Org HTML (§ comorbidity matrix)
const COMORBIDITY_CASCADE: Record<PathologyType, { downstream: PathologyType; risk_he: string }[]> = {
  NOD: [
    { downstream: 'OLD', risk_he: 'סטיות שאינן מזוהות מונעות למידה מכשלים — OLD מסתבר' },
  ],
  ZSG_SAFETY: [
    { downstream: 'OLD', risk_he: 'בלי בטחון פסיכולוגי — למידה מכשלים נחתכת; OLD צפוי' },
  ],
  ZSG_CULTURE: [
    { downstream: 'OLD', risk_he: 'תרבות האשמה מונעת Post-Mortem אמיתי — OLD צפוי' },
    { downstream: 'CS', risk_he: 'תחרות פנימית מתמשכת שוחקת רגשית — CS מסתבר' },
  ],
  OLD: [
    { downstream: 'NOD', risk_he: 'חוסר למידה מסטיות מנרמל אותן בדיעבד — NOD מגביר' },
  ],
  CLT: [
    { downstream: 'NOD', risk_he: 'עומס ארכיטקטוני הופך דילוגים להרגל — NOD מסתבר' },
  ],
  CS: [
    { downstream: 'NOD', risk_he: 'תחת לחץ כרוני, סטיות מתנרמלות מהר יותר' },
    { downstream: 'CLT', risk_he: 'שחיקה רגשית מצמצמת קיבולת קוגניטיבית — CLT מוגבר' },
    { downstream: 'ZSG_CULTURE', risk_he: 'תחושת איום קיומי מגבירה תחרות פנימית' },
    { downstream: 'OLD', risk_he: 'יכולת למידה פוחתת תחת cortisol כרוני' },
  ],
}

const QUICK_CHIPS: Record<DiagnosticAxis, string[]> = {
  DR: ['החלטות נתקעות שבועות', 'הכל עולה ל-CEO', 'ישיבות ללא פלט', 'אי-בהירות על מי מחליט'],
  ND: ['כולם יודעים, אף אחד לא עוצר', 'QA הפך להמלצה', 'כיסוי לפני תיקון', 'post-mortem לא מיושם'],
  UC: ['רק X יודע איך זה עובד', 'roadmap לא ריאלי', 'מילואים ריקנו צוות', 'onboarding שבועות'],
  SC: ['תפקידים חופפים', 'אין בעלות ברורה', 'תהליך לא מתועד', 'אסטרטגיה לא יורדת לביצוע'],
}

const QUICK_CHIPS_OMS: Record<DiagnosticAxis, string[]> = {
  DR: ['המתנה ללקוח/ספק', 'הכל עליי בלי delegation', 'אין זמן להחליט', 'החלטות בווטסאפ בלי תיעוד'],
  ND: ['חותכים פינות כדי לספק', 'אין זמן ללמוד מהטעות', 'ידוע שלא אידיאלי ולא עוצרים', 'תיקון זמני שהפך קבוע'],
  UC: ['רק אני יודע איך זה עובד', 'תוכנית בראש בלי ולידציה', 'תלות בלקוח אחד', 'אין מסלול לבעיה עם ספק'],
  SC: ['Scope לא מוגדר', 'אין SOP מתועד', 'שני אחראים = אף אחד', 'אסטרטגיה לא יורדת למשימות'],
}

// ─── Draft persistence ────────────────────────────────────────────────────────

interface WizardDraft {
  stage: WizardStage
  scores: TriageScores
  answers: Record<string, string>
  currentQ: number
  savedAt: number
  operatingContext?: OperatingContext
}

function draftKey(clientId: string) {
  return `diagnostic_draft_${clientId}`
}

function loadDraft(clientId: string): WizardDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(clientId))
    if (!raw) return null
    const draft = JSON.parse(raw) as WizardDraft
    // Discard drafts older than 7 days
    if (Date.now() - draft.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(draftKey(clientId))
      return null
    }
    return draft
  } catch {
    return null
  }
}

function saveDraft(clientId: string, draft: Omit<WizardDraft, 'savedAt'>) {
  try {
    localStorage.setItem(draftKey(clientId), JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    // localStorage might be unavailable (SSR guard / private mode)
  }
}

function clearDraft(clientId: string) {
  try {
    localStorage.removeItem(draftKey(clientId))
  } catch {}
}

// ─── Component ───────────────────────────────────────────────────────────────

type WizardStage = 'triage' | 'questions' | 'analyzing' | 'result'

interface TriageScores { dr: number; nd: number; uc: number; sc: number }

interface Props {
  clientId: string
  clientName: string
  sprintCount: number
  clientOperatingContext?: OperatingContext | null
}

export function DiagnosticWizard({
  clientId,
  clientName,
  sprintCount,
  clientOperatingContext = null,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Stage
  const [stage, setStage] = useState<WizardStage>('triage')

  /** הקשר לאבחון פתוח — מאותחל מפרופיל הלקוח אם הוגדר */
  const [operatingContext, setOperatingContext] = useState<OperatingContext>(() =>
    clientOperatingContext === 'one_man_show' ? 'one_man_show' : 'team'
  )

  // Triage
  const [scores, setScores] = useState<TriageScores>({ dr: 3, nd: 3, uc: 3, sc: 3 })
  const [greinerStage, setGreinerStage] = useState<'phase_1_2' | 'phase_3' | 'phase_4' | 'phase_5'>('phase_1_2')
  const [adaptiveCapacity, setAdaptiveCapacity] = useState<'rigid' | 'slow_adapt' | 'agile'>('slow_adapt')
  const [voiceInfrastructure, setVoiceInfrastructure] = useState<'no_channel' | 'unused_channel' | 'effective_channel'>('unused_channel')
  const liveProfile = profileFromScores(scores)
  const liveAxis = getDominantAxis(scores)

  // ROI inputs
  const [teamSize, setTeamSize] = useState(50)
  const [hourlyRate, setHourlyRate] = useState(200)

  // Questions (targeted: only dominant axis)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')

  // Result
  const [finalScores, setFinalScores] = useState<TriageScores | null>(null)
  const [finalProfile, setFinalProfile] = useState<PathologyProfile | null>(null)
  const [finalPathologyType, setFinalPathologyType] = useState<PathologyType | null>(null)
  const [finalCsAmplifier, setFinalCsAmplifier] = useState(false)
  const [finalTam, setFinalTam] = useState<{ t: number; a: number; m: number } | null>(null)
  const [finalConfidence, setFinalConfidence] = useState<number | null>(null)
  const [plan, setPlan] = useState<ActionPlanItem[]>([])
  const [triggerRules, setTriggerRules] = useState<ReturnType<typeof evaluateTriggerRules>>([])
  const [runtimeConfig, setRuntimeConfig] = useState<DiagnosticRuntimeConfig | null>(null)

  // Sprint creation
  const [creatingSprintId, setCreatingSprintId] = useState(false)

  // Constraint envelope
  const [tMax, setTMax] = useState<30 | 60 | 90>(90)
  const [rMax, setRMax] = useState<1 | 2 | 3 | 4 | 5>(2)

  // PDF export
  const [exportingPdf, setExportingPdf] = useState(false)

  // Draft restore banner
  const [draftRestored, setDraftRestored] = useState(false)

  // ── Draft: restore on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fallback: OperatingContext =
      clientOperatingContext === 'one_man_show' ? 'one_man_show' : 'team'
    const draft = loadDraft(clientId)
    if (draft && (draft.stage === 'triage' || draft.stage === 'questions')) {
      setScores(draft.scores)
      setAnswers(draft.answers)
      setCurrentQ(draft.currentQ)
      setStage(draft.stage)
      setOperatingContext(
        draft.operatingContext === 'one_man_show'
          ? 'one_man_show'
          : draft.operatingContext === 'team'
            ? 'team'
            : fallback
      )
      setDraftRestored(true)
    }
  }, [clientId, clientOperatingContext])

  useEffect(() => {
    fetch('/api/diagnostic/config')
      .then(async (res) => {
        if (!res.ok) throw new Error('config unavailable')
        return (await res.json()) as DiagnosticRuntimeConfig
      })
      .then((cfg) => setRuntimeConfig(cfg))
      .catch(() => {
        // Graceful fallback to in-code defaults
      })
  }, [])

  // ── Draft: auto-save with debounce ────────────────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (stage === 'triage' || stage === 'questions') {
        saveDraft(clientId, { stage, scores, answers, currentQ, operatingContext })
      }
    }, 800)
  }, [clientId, stage, scores, answers, currentQ, operatingContext])

  useEffect(() => {
    scheduleSave()
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [scheduleSave])

  // Targeted questions = only questions for dominant axis (ניסוח לפי team / One man show)
  const targetedQuestions = useMemo(
    () => getDiagnosticQuestions(operatingContext).filter((q) => q.axis === liveAxis),
    [operatingContext, liveAxis]
  )

  const ucBreakdown = {
    learning: Math.max(0, Math.min(10, scores.uc)),
    semantic: Math.max(0, Math.min(10, scores.uc * 0.9)),
    psi: voiceInfrastructure === 'effective_channel' ? 2.5 : voiceInfrastructure === 'unused_channel' ? 5.5 : 8.0,
    adaptive: adaptiveCapacity === 'agile' ? 2.0 : adaptiveCapacity === 'slow_adapt' ? 5.0 : 8.0,
  }

  const greinerBadge =
    greinerStage === 'phase_3'
      ? 'Greiner Phase 3: SC threshold lowered'
      : greinerStage === 'phase_4'
        ? 'Greiner Phase 4: ND threshold lowered'
        : greinerStage === 'phase_5'
          ? 'Greiner Phase 5: UC threshold lowered'
          : null

  // ── Triage handlers ──────────────────────────────────────────────────────

  function handleSlider(axis: keyof TriageScores, value: number) {
    setScores(prev => ({ ...prev, [axis]: value }))
  }

  function analyzeFromSliders() {
    const profile = profileFromScores(scores)
    const axis = getDominantAxis(scores)
    const envelope: ConstraintEnvelope = { t_max: tMax, r_max: rMax }
    const unified = runUnifiedTreatmentPipeline({
      scores,
      envelope,
      runtimeConfig: runtimeConfig?.evidenceProfiles
        ? { evidenceProfiles: runtimeConfig.evidenceProfiles }
        : undefined,
    })
    const syn = unified.orgPathology
    const pType = syn.primaryType
    const csAmp = syn.csAmplifier
    const interventions = unified.items
    const triggers = runtimeConfig?.triggerRules
      ? evaluateTriggerRulesWithConfig({ profile, dominantAxis: axis, scores, pathologyType: pType }, runtimeConfig.triggerRules)
      : evaluateTriggerRules({ profile, dominantAxis: axis, scores, pathologyType: pType })
    setFinalScores(scores)
    setFinalProfile(profile)
    setFinalPathologyType(pType)
    setFinalCsAmplifier(csAmp)
    setFinalTam(null)
    setFinalConfidence(null)
    setPlan(interventions)
    setTriggerRules(triggers)
    clearDraft(clientId)
    setStage('result')
    logUxEvent({ name: 'diagnostic_completed', ts: Date.now(), data: { method: 'slider', clientId } })
  }

  function goToQuestions() {
    setCurrentQ(0)
    setAnswers({})
    setCurrentAnswer('')
    setStage('questions')
  }

  // ── Question handlers ────────────────────────────────────────────────────

  function handleNext() {
    if (currentAnswer.trim().length < 5) {
      toast.error('נדרשת תשובה לפני המשך')
      return
    }
    const q = targetedQuestions[currentQ]
    const newAnswers = { ...answers, [q.id]: currentAnswer.trim() }
    setAnswers(newAnswers)
    setCurrentAnswer('')
    if (currentQ < targetedQuestions.length - 1) {
      setCurrentQ(i => i + 1)
    } else {
      runEmbeddingAnalysis(newAnswers)
    }
  }

  function handleSkip() {
    if (currentQ < targetedQuestions.length - 1) {
      setCurrentQ(i => i + 1)
      setCurrentAnswer('')
    } else {
      runEmbeddingAnalysis(answers)
    }
  }

  async function runEmbeddingAnalysis(finalAnswers: Record<string, string>) {
    const nonEmpty = Object.values(finalAnswers).filter(v => v?.trim().length > 10)
    if (nonEmpty.length < 1) {
      analyzeFromSliders()
      return
    }
    setStage('analyzing')
    try {
      buildEmbeddingText(finalAnswers, operatingContext)
      const res = await fetch('/api/diagnostic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, clientId, scores, operatingContext }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'שגיאה בניתוח')
      }
      const data: DiagnosticAnalysisResult = await res.json()
      const embeddedScores = data.topMatch.inferredScores
      // Blend: embedding 60%, slider 40%
      const blended: TriageScores = {
        dr: embeddedScores.dr * 0.6 + scores.dr * 0.4,
        nd: embeddedScores.nd * 0.6 + scores.nd * 0.4,
        uc: embeddedScores.uc * 0.6 + scores.uc * 0.4,
        sc: scores.sc,
      }
      const profile = data.topMatch.profile
      const axis = getDominantAxis(blended)
      const envelope: ConstraintEnvelope = { t_max: tMax, r_max: rMax }
      const unified = runUnifiedTreatmentPipeline({
        scores: blended,
        envelope,
        runtimeConfig: runtimeConfig?.evidenceProfiles
          ? { evidenceProfiles: runtimeConfig.evidenceProfiles }
          : undefined,
      })
      const syn = unified.orgPathology
      const pType = syn.primaryType
      const csAmp = syn.csAmplifier
      const interventions = unified.items
      const triggers = runtimeConfig?.triggerRules
        ? evaluateTriggerRulesWithConfig({ profile, dominantAxis: axis, scores: blended, pathologyType: pType }, runtimeConfig.triggerRules)
        : evaluateTriggerRules({ profile, dominantAxis: axis, scores: blended, pathologyType: pType })
      setFinalScores(blended)
      setFinalProfile(profile)
      setFinalPathologyType(pType)
      setFinalCsAmplifier(csAmp)
      setFinalTam(data.topType.tam)
      setFinalConfidence(Math.round(data.topMatch.similarity * 100))
      setPlan(interventions)
      setTriggerRules(triggers)
      clearDraft(clientId)
      setStage('result')
      logUxEvent({ name: 'diagnostic_completed', ts: Date.now(), data: { method: 'embedding', clientId } })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'שגיאה — ממשיך עם ניתוח Slider')
      analyzeFromSliders()
    }
  }

  // ── PDF export ───────────────────────────────────────────────────────────

  async function handleExportPdf() {
    if (!finalProfile || !finalScores || !finalPathologyType) return
    setExportingPdf(true)
    try {
      const cascades = finalPathologyType ? COMORBIDITY_CASCADE[finalPathologyType] ?? [] : []
      const protocol = finalPathologyType ? PATHOLOGY_PROTOCOL_MAP[finalPathologyType] : undefined
      const body = {
        clientName: clientName,
        profile: finalProfile,
        pathologyType: finalPathologyType,
        pathologyTypeLabel: PATHOLOGY_TYPE_LABELS[finalPathologyType],
        scores: finalScores,
        confidence: finalConfidence ?? undefined,
        tam: finalTam ?? undefined,
        teamSize,
        hourlyRate,
        roi: teamSize * hourlyRate * 52,
        protocol,
        plan: plan.map(i => ({
          axis: i.axis, horizon: i.horizon,
          title_he: i.title_he, what_he: i.what_he, metric_he: i.metric_he,
        })),
        comorbidities: cascades,
      }
      const res = await fetch('/api/diagnostic/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('שגיאה ביצירת PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `COR-SYS_${clientName.replace(/\s+/g,'_')}_diagnostic.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF הורד')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'שגיאה ב-PDF export')
    } finally {
      setExportingPdf(false)
    }
  }

  // ── Sprint creation ───────────────────────────────────────────────────────

  async function handleCreateSprint() {
    if (!finalProfile || !finalScores || plan.length === 0) return
    setCreatingSprintId(true)
    try {
      const axis = getDominantAxis(finalScores)
      const result = await createDiagnosticSprintAction({
        clientId,
        profile: finalProfile,
        dominantAxis: axis,
        dr: finalScores.dr,
        nd: finalScores.nd,
        uc: finalScores.uc,
        interventions: plan,
        sprintNumber: sprintCount + 1,
      })
      if (!result.ok) throw new Error(result.error)
      toast.success('ספרינט נוצר עם 3 משימות')
      startTransition(() => {
        router.push(`/clients/${clientId}/sprints/${result.sprintId}`)
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'שגיאה ביצירת ספרינט')
      setCreatingSprintId(false)
    }
  }

  // ── Renders ──────────────────────────────────────────────────────────────

  if (stage === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-800" />
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-white font-bold">מנתח תשובות...</p>
          <p className="text-slate-500 text-xs font-mono">embedding · cosine similarity · pathology match</p>
        </div>
      </div>
    )
  }

  if (stage === 'result' && finalProfile && finalScores) {
    const ps = PROFILE_STYLE[finalProfile]
    const axis = getDominantAxis(finalScores)
    const axisConf = AXIS_CONFIG[axis]
    const protocol = finalPathologyType ? PATHOLOGY_PROTOCOL_MAP[finalPathologyType] : null
    const gates = runtimeConfig?.gateReviews
      ? build90DayGateReviewsWithConfig(runtimeConfig.gateReviews)
      : build90DayGateReviews()

    return (
      <div className="space-y-4 animate-fade-up delay-0">

        {/* CS Amplifier warning */}
        {finalCsAmplifier && (
          <div className="rounded-xl p-3 border border-red-500/40 bg-red-500/10 flex items-start gap-3">
            <span className="text-red-400 text-base mt-0.5">⚠</span>
            <div>
              <p className="text-red-300 font-bold text-xs">מגביר מערכתי פעיל — CS</p>
              <p className="text-red-400/70 text-[11px] leading-relaxed">
                לחץ כרוני מזוהה בכל שלושת הצירים. טיפול ב-CS קודם לכל התערבות אחרת — אחרת היעילות תיפגע.
              </p>
            </div>
          </div>
        )}

        {/* Profile header */}
        <div className={`rounded-2xl p-5 border ${ps.border} ${ps.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${ps.dot} animate-pulse`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${ps.color}`}>
                פרופיל שזוהה
              </span>
            </div>
            {finalConfidence !== null && (
              <span className="text-xs font-mono text-slate-500">{finalConfidence}% match · embedding</span>
            )}
          </div>
          <h2 className={`text-3xl font-black ${ps.color}`}>{PROFILE_LABELS[finalProfile]}</h2>

          {/* Pathology type badge */}
          {finalPathologyType && (
            <div className="mt-2 mb-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">סוג פתולוגיה</span>
              <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded font-mono">
                {finalPathologyType}
              </span>
              <span className="text-xs text-slate-400">{PATHOLOGY_TYPE_LABELS[finalPathologyType]}</span>
            </div>
          )}

          <div className="flex gap-4 mt-3 flex-wrap">
            {(['DR', 'ND', 'UC', 'SC'] as const).map(a => (
              <div key={a} className="text-center">
                <p className={`text-xs font-bold ${AXIS_CONFIG[a].color}`}>{a}</p>
                <p className="text-lg font-black text-white font-mono">{finalScores[a.toLowerCase() as keyof TriageScores].toFixed(1)}</p>
              </div>
            ))}
            <div className="text-center mr-auto">
              <p className="text-xs text-slate-500">ציר דומיננטי</p>
              <p className={`text-sm font-bold ${axisConf.color}`}>{axis} · {axisConf.label_he}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">UC Breakdown</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['Learning', ucBreakdown.learning],
                ['Semantic', ucBreakdown.semantic],
                ['PSI', ucBreakdown.psi],
                ['Adaptive', ucBreakdown.adaptive],
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-900/70 border border-slate-700/50 p-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{label}</span>
                    <span className="font-mono">{value.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-700">
                    <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, value * 10)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {greinerBadge && (
              <div className="mt-2">
                <span className="status-badge status-warning">{greinerBadge}</span>
              </div>
            )}
          </div>

          {/* T/A/M cost signature */}
          {finalTam && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-4">
              {([['T', 'זמן', 'text-green-400'], ['A', 'קשב', 'text-orange-400'], ['M', 'כסף', 'text-blue-400']] as const).map(([key, label, color]) => {
                const val = finalTam[key.toLowerCase() as 't' | 'a' | 'm']
                return (
                  <div key={key} className="flex-1 text-center">
                    <p className={`text-[10px] font-bold ${color}`}>{key} · {label}</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} className={`inline-block w-3 h-1.5 rounded-sm ${n <= val ? color.replace('text-','bg-') : 'bg-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ROI projection */}
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">חיסכון פוטנציאלי</p>
              <p className="text-lg font-black text-emerald-400 font-mono">
                {(teamSize * hourlyRate * 52).toLocaleString('he-IL')} ₪
              </p>
              <p className="text-[10px] text-slate-600">לשנה · {teamSize} עובדים × {hourlyRate} ₪/שעה × 52 שבועות</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">בסיס הגרנטיה</p>
              <p className="text-xs text-slate-300">שעת עבודה אחת לעובד לשבוע<br />לכל שארית חיי התהליך</p>
            </div>
          </div>

          {/* Protocol */}
          {protocol && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">פרוטוקול מומלץ</p>
              <p className="text-xs font-bold text-white font-mono">{protocol.protocol}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{protocol.successKpi}</p>
            </div>
          )}
        </div>

        {/* Action plan */}
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest px-1">תוכנית פעולה · {plan.length} התערבויות</p>
          {plan.map((item, i) => {
            const ac = AXIS_CONFIG[item.axis]
            return (
              <div
                key={`${item.axis}-${item.priority}`}
                className={`rounded-2xl border p-4 animate-fade-up ${ac.borderColor} ${ac.bgColor}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-600 font-mono text-xs w-4">{i + 1}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ac.borderColor} ${ac.color}`}>
                      {item.axis}
                    </span>
                    <span className="text-[10px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded font-mono">
                      {HORIZON_LABELS[item.horizon]}
                    </span>
                    {item._ius && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                        IUS {item._ius.score}
                      </span>
                    )}
                    {item._ius?.mvc_revised && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        MVC
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{item.tag}</span>
                </div>
                <p className="text-white font-bold text-sm mb-1">{item.title_he}</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-2">{item.what_he}</p>
                {item._ius?.mvc_revised && item._ius.mvc_description && (
                  <div className="mb-2 p-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
                    <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-0.5">התאמת MVC</p>
                    <p className="text-[11px] text-amber-300/70">{item._ius.mvc_description}</p>
                  </div>
                )}
                <div className="border-t border-slate-700/50 pt-2 flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">מדד</p>
                    <p className="text-xs text-slate-300">{item.metric_he}</p>
                  </div>
                </div>
                {item.evidence && (
                  <div className="mt-2 rounded-lg border border-slate-700/40 bg-slate-900/40 p-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Evidence · {item.evidence.level}
                    </p>
                    <p className="text-[11px] text-slate-300">{item.evidence.evidence_note}</p>
                  </div>
                )}
                {item.kpi_stack && (
                  <div className="mt-2 rounded-lg border border-slate-700/40 bg-slate-900/40 p-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">KPI Stack</p>
                    <p className="text-[11px] text-slate-300">
                      Leading: {item.kpi_stack.leading.map((m) => m.name).join(' · ')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lagging: {item.kpi_stack.lagging.map((m) => m.name).join(' · ')}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Baseline: {item.kpi_stack.baseline} | Cadence: {item.kpi_stack.cadence}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Comorbidity cascade */}
        {finalPathologyType && COMORBIDITY_CASCADE[finalPathologyType]?.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-bold">
              פתולוגיות משניות בסיכון — cascade
            </p>
            {COMORBIDITY_CASCADE[finalPathologyType].map(({ downstream, risk_he }) => (
              <div key={downstream} className="flex items-start gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  {finalPathologyType} → {downstream}
                </span>
                <span className="text-[11px] text-slate-400">{risk_he}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trigger rules */}
        {triggerRules.length > 0 && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Trigger Rules פעילים
            </p>
            {triggerRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-2">
                <p className="text-[11px] text-slate-200 font-semibold">{rule.if_condition}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{rule.then_action}</p>
              </div>
            ))}
          </div>
        )}

        {/* 90-day gates */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            90-Day Gate Reviews
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gates.map((gate) => (
              <div key={gate.id} className="rounded-lg border border-slate-700/60 bg-slate-950/40 p-2">
                <p className="text-[11px] text-white font-semibold">שבוע {gate.week} · {gate.title_he}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{gate.pass_criteria.join(' | ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleCreateSprint}
            disabled={creatingSprintId}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
          >
            {creatingSprintId ? 'יוצר ספרינט...' : 'צור ספרינט מהתוכנית ←'}
          </button>
          <button
            onClick={() => router.push(`/clients/${clientId}/snapshot/new?dr=${finalScores.dr.toFixed(1)}&nd=${finalScores.nd.toFixed(1)}&uc=${finalScores.uc.toFixed(1)}&profile=${finalProfile}`)}
            className="px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm"
          >
            שמור כ-Snapshot
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="px-4 py-3 rounded-xl border border-indigo-700 text-indigo-400 hover:text-white hover:border-indigo-500 hover:bg-indigo-900/30 transition-all text-sm disabled:opacity-40"
          >
            {exportingPdf ? 'מייצא...' : 'ייצא PDF ↓'}
          </button>
        </div>
        <button
          onClick={() => setStage('triage')}
          className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors pt-1"
        >
          חזור לכיול
        </button>
      </div>
    )
  }

  if (stage === 'questions') {
    const q = targetedQuestions[currentQ]
    const ac = AXIS_CONFIG[q.axis]
    const total = targetedQuestions.length
    const progress = Math.round((currentQ / total) * 100)
    const chips =
      operatingContext === 'one_man_show' ? QUICK_CHIPS_OMS[q.axis] : QUICK_CHIPS[q.axis]

    return (
      <div className="space-y-5 animate-fade-up delay-0">

        {/* Axis context */}
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${ac.borderColor} ${ac.bgColor}`}>
          <span className={`text-xs font-black ${ac.color}`}>{q.axis}</span>
          <span className="text-slate-400 text-xs">{ac.label_he}</span>
          <span className="mr-auto text-[10px] text-slate-600 font-mono">{currentQ + 1}/{total}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-0.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${ac.trackColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <p className="text-white font-bold text-base leading-relaxed">{q.question_he}</p>
        {q.probe_he && (
          <p className="text-slate-500 text-xs -mt-2">{q.probe_he}</p>
        )}

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setCurrentAnswer(prev => prev ? `${prev}, ${chip}` : chip)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Answer */}
        <textarea
          value={currentAnswer}
          onChange={e => setCurrentAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleNext() }}
          placeholder="תאר במילים שלך..."
          rows={4}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
          autoFocus
        />
        <p className="text-[10px] text-slate-600 -mt-3">Cmd+Enter להמשך</p>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleNext}
            disabled={currentAnswer.trim().length < 5}
            className="flex-1 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
          >
            {currentQ < total - 1 ? 'הבא ←' : 'נתח ←'}
          </button>
          <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 text-sm transition-all">
            דלג
          </button>
          {currentQ > 0 && (
            <button
              onClick={() => { setCurrentQ(i => i - 1); setCurrentAnswer(answers[targetedQuestions[currentQ - 1].id] ?? '') }}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 text-sm transition-all"
            >
              ←
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Stage: TRIAGE ────────────────────────────────────────────────────────

  const ps = PROFILE_STYLE[liveProfile]
  const axisConf = AXIS_CONFIG[liveAxis]

  return (
    <div className="space-y-6 animate-fade-up delay-0">

      {/* Draft restore banner */}
      {draftRestored && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/25">
          <p className="text-xs text-indigo-300">
            <span className="font-bold">טיוטה שוחזרה</span> — המשך מהמקום שעצרת
          </p>
          <button
            onClick={() => {
              clearDraft(clientId)
              setScores({ dr: 3, nd: 3, uc: 3, sc: 3 })
              setAnswers({})
              setCurrentQ(0)
              setOperatingContext('team')
              setDraftRestored(false)
            }}
            className="text-[10px] text-indigo-500 hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            נקה טיוטה
          </button>
        </div>
      )}

      {/* הקשר אבחון: צוות מול One man show */}
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">הקשר לקוח</p>
        <p className="text-xs text-slate-400">
          בוחרים את מסלול הניסוח לשאלות הפתוחות (לא משנה את מנוע הציונים — רק את השפה וההקשר).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setOperatingContext('team')
              setCurrentQ(0)
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              operatingContext === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            ארגון עם צוות
          </button>
          <button
            type="button"
            onClick={() => {
              setOperatingContext('one_man_show')
              setCurrentQ(0)
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              operatingContext === 'one_man_show'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            One man show / עצמאי
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {(['DR', 'ND', 'UC', 'SC'] as const).map(axis => {
          const conf = AXIS_CONFIG[axis]
          const val = scores[axis.toLowerCase() as keyof TriageScores]
          const isDominant = axis === liveAxis
          return (
            <div
              key={axis}
              className={`rounded-2xl p-4 border transition-all ${
                isDominant ? `${conf.borderColor} ${conf.bgColor}` : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${conf.color}`}>{axis}</span>
                  <span className="text-slate-500 text-xs">{conf.label_he}</span>
                  {isDominant && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${conf.borderColor} ${conf.color} font-bold`}>
                      ↑ דומיננטי
                    </span>
                  )}
                </div>
                <span className={`text-lg font-black font-mono ${conf.color}`}>{val.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={val}
                onChange={e => handleSlider(axis.toLowerCase() as keyof TriageScores, parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to left, ${conf.thumbColor} 0%, ${conf.thumbColor} ${val * 10}%, #1e293b ${val * 10}%, #1e293b 100%)`,
                  accentColor: conf.thumbColor,
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-700 mt-1">
                <span>תקין</span>
                <span>קריסה</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ROI inputs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">כיול ROI — לחישוב חיסכון</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">גודל צוות</span>
              <span className="text-xs font-mono font-bold text-white">{teamSize}</span>
            </div>
            <input
              type="range" min={5} max={300} step={5} value={teamSize}
              onChange={e => setTeamSize(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#64748b' }}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">שכר שעתי ממוצע (₪)</span>
              <span className="text-xs font-mono font-bold text-white">{hourlyRate}</span>
            </div>
            <input
              type="range" min={80} max={600} step={10} value={hourlyRate}
              onChange={e => setHourlyRate(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#64748b' }}
            />
          </div>
        </div>
        <p className="text-[11px] text-slate-600">
          חיסכון פוטנציאלי: <span className="text-slate-300 font-bold font-mono">
            {(teamSize * hourlyRate * 52).toLocaleString('he-IL')} ₪/שנה
          </span>
          <span className="text-slate-700"> · לפי שעת עבודה אחת לעובד לשבוע</span>
        </p>
      </div>

      {/* Greiner / UC moderators */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Greiner + UC Moderators</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={greinerStage}
            onChange={(e) => setGreinerStage(e.target.value as typeof greinerStage)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            <option value="phase_1_2">Greiner 1-2 (Leadership/Autonomy)</option>
            <option value="phase_3">Greiner 3 (Control crisis)</option>
            <option value="phase_4">Greiner 4 (Red tape)</option>
            <option value="phase_5">Greiner 5 (Renewal)</option>
          </select>
          <select
            value={adaptiveCapacity}
            onChange={(e) => setAdaptiveCapacity(e.target.value as typeof adaptiveCapacity)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            <option value="rigid">Adaptive: Rigid</option>
            <option value="slow_adapt">Adaptive: Slow</option>
            <option value="agile">Adaptive: Agile</option>
          </select>
          <select
            value={voiceInfrastructure}
            onChange={(e) => setVoiceInfrastructure(e.target.value as typeof voiceInfrastructure)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          >
            <option value="no_channel">Voice: No channel</option>
            <option value="unused_channel">Voice: Unused channel</option>
            <option value="effective_channel">Voice: Effective channel</option>
          </select>
        </div>
        {greinerBadge && <p className="text-[10px] text-amber-300">{greinerBadge}</p>}
      </div>

      {/* Constraint Envelope */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Constraint Envelope — אילוצי ביצוע</p>
        <div className="flex gap-4">
          {/* T_max */}
          <div className="flex-1 space-y-1.5">
            <span className="text-xs text-slate-400">אופק זמן מרבי</span>
            <div className="flex gap-1.5">
              {([30, 60, 90] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setTMax(d)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                    tMax === d
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {/* R_max */}
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">עמידות לשינוי</span>
              <span className="text-[11px] font-mono text-slate-300 font-bold">{rMax}</span>
            </div>
            <input
              type="range" min={1} max={5} step={1} value={rMax}
              onChange={e => setRMax(Number(e.target.value) as 1|2|3|4|5)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#6366f1' }}
            />
            <div className="flex justify-between text-[9px] text-slate-700">
              <span>מוכן</span>
              <span>שחוק</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-700">
          ייסנן את ההתערבויות לפי יכולת הביצוע בפועל · תוכנית MVC תוצע לחריגות
        </p>
      </div>

      {/* Live profile indicator */}
      <div className={`rounded-2xl p-4 border ${ps.border} ${ps.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${ps.dot} animate-pulse`} />
          <span className={`text-sm font-bold ${ps.color}`}>{PROFILE_LABELS[liveProfile]}</span>
        </div>
        <span className="text-xs text-slate-500">
          ציר: <span className={`font-bold ${axisConf.color}`}>{liveAxis}</span> · {axisConf.label_he}
        </span>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <button
          onClick={analyzeFromSliders}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white transition-all ${ps.bg} border ${ps.border}`}
        >
          נתח עכשיו ←
        </button>
        <button
          onClick={goToQuestions}
          className="px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm"
        >
          + העמק עם שאלות
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-700">
        כיול מהיר: 30 שניות · עם שאלות: 3-5 דקות + embedding
      </p>

    </div>
  )
}