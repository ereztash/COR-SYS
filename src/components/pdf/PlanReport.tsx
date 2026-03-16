import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 16, fontWeight: 'bold' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10, marginBottom: 6, color: '#64748b', textTransform: 'uppercase' },
  body: { fontSize: 10, lineHeight: 1.5 },
  row: { flexDirection: 'row', marginBottom: 4 },
  code: { fontSize: 10, fontWeight: 'bold', width: 50 },
  score: { fontSize: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 2 },
})

export function PlanReport({
  clientName,
  summary,
  entropyScore,
  diagnosisParagraph,
  ctaParagraph,
  codes,
  pathologies,
  protocols,
}: {
  clientName: string
  summary: string
  entropyScore: number
  diagnosisParagraph: string
  ctaParagraph: string
  codes: string[]
  pathologies: { code: string; nameHe: string; score: number }[]
  protocols: { nameHe: string; phase: string; components: { step: string; detail: string }[] }[]
}) {
  return (
    <Document title={`תוכנית עסקית — ${clientName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>COR-SYS — דו"ח אבחון ארגוני</Text>
        <Text style={styles.body}>{clientName}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>סיכום</Text>
          <Text style={styles.body}>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ציון אנטרופיה</Text>
          <Text style={styles.body}>{entropyScore}/4 פתולוגיות בחומרה גבוהה</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אבחון פתולוגיות</Text>
          <Text style={styles.body}>{diagnosisParagraph}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>קודי DSM</Text>
          <Text style={styles.body}>{codes.join(', ') || '—'}</Text>
        </View>

        {pathologies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פירוט ציונים</Text>
            {pathologies.map((p) => (
              <View key={p.code} style={styles.row}>
                <Text style={styles.code}>{p.code}</Text>
                <Text style={styles.body}> — {p.nameHe}: {p.score.toFixed(1)}/10</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>המלצה אופרטיבית</Text>
          <Text style={styles.body}>{ctaParagraph}</Text>
        </View>

        {protocols.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פרוטוקולי התערבות מומלצים</Text>
            {protocols.map((pro, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.body}>{pro.nameHe} ({pro.phase})</Text>
                {pro.components.slice(0, 3).map((c, j) => (
                  <Text key={j} style={[styles.body, { marginRight: 12 }]}>• {c.step}: {c.detail}</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
