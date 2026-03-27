#!/usr/bin/env python3
"""
COR-SYS Diagnostic Report PDF Generator
Reads JSON from stdin, writes PDF bytes to stdout.

Usage:
  echo '{"clientName":"...","profile":"critical",...}' | python3 generate_diagnostic_pdf.py
"""

import sys
import json
import io
from datetime import datetime

from bidi.algorithm import get_display
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

# ─── Font registration ────────────────────────────────────────────────────────
FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_BOLD  = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('Hebrew',     FONT_PATH))
pdfmetrics.registerFont(TTFont('Hebrew-Bold', FONT_BOLD))

# ─── Colour palette ───────────────────────────────────────────────────────────
BG        = colors.HexColor('#0f172a')
SURFACE   = colors.HexColor('#1e293b')
BORDER    = colors.HexColor('#334155')
TEXT      = colors.HexColor('#f1f5f9')
MUTED     = colors.HexColor('#94a3b8')
ACCENT    = colors.HexColor('#3b82f6')
EMERALD   = colors.HexColor('#10b981')
RED       = colors.HexColor('#ef4444')
AMBER     = colors.HexColor('#f59e0b')
WHITE     = colors.white

PROFILE_COLORS = {
    'healthy':            colors.HexColor('#10b981'),
    'at-risk':            colors.HexColor('#eab308'),
    'critical':           colors.HexColor('#f97316'),
    'systemic-collapse':  colors.HexColor('#ef4444'),
}
PROFILE_LABELS_HE = {
    'healthy':            'תקין',
    'at-risk':            'בסיכון',
    'critical':           'קריטי',
    'systemic-collapse':  'קריסה מערכתית',
}

# ─── Helper: bidi + RTL ───────────────────────────────────────────────────────
def h(text: str) -> str:
    """Apply bidi algorithm for Hebrew display in LTR canvas."""
    if not text:
        return ''
    return get_display(str(text))

def p(text: str, style) -> Paragraph:
    return Paragraph(h(text), style)

# ─── Styles ───────────────────────────────────────────────────────────────────
def make_styles():
    def s(name, font='Hebrew', size=9, color=None, align=TA_RIGHT, leading=14, after=3):
        return ParagraphStyle(name, fontName=font, fontSize=size,
            textColor=color or MUTED, alignment=align, leading=leading, spaceAfter=after)

    return {
        'h1':     s('h1',     'Hebrew-Bold', 22, WHITE,   TA_RIGHT, 28, 6),
        'h2':     s('h2',     'Hebrew-Bold', 13, WHITE,   TA_RIGHT, 18, 4),
        'h3':     s('h3',     'Hebrew-Bold', 10, MUTED,   TA_RIGHT, 14, 2),
        'body':   s('body',   'Hebrew',       9, MUTED,   TA_RIGHT, 13, 3),
        'mono':   s('mono',   'Hebrew',       8, MUTED,   TA_RIGHT, 12, 2),
        'roi':    s('roi',    'Hebrew-Bold', 18, EMERALD, TA_RIGHT, 24, 2),
        'tag':    s('tag',    'Hebrew-Bold',  7, ACCENT,  TA_RIGHT, 11, 1),
        'metric': s('metric', 'Hebrew',       8, EMERALD, TA_RIGHT, 12, 2),
        'comorbid':s('comorbid','Hebrew',     8, AMBER,   TA_RIGHT, 12, 2),
    }

# ─── TAM bar helper ───────────────────────────────────────────────────────────
def tam_bar_table(tam: dict, styles: dict):
    """Returns a Table rendering the T/A/M bars."""
    labels = [('T', 'זמן', '#10b981'), ('A', 'קשב', '#f97316'), ('M', 'כסף', '#3b82f6')]
    rows = []
    for key, label, color in labels:
        val = tam.get(key.lower(), 0)
        filled   = '■ ' * val
        unfilled = '□ ' * (5 - val)
        bar_text = h(f'{label} {filled}{unfilled}')
        bar_style = ParagraphStyle('bar', fontName='Hebrew', fontSize=8,
            textColor=colors.HexColor(color), alignment=TA_RIGHT, leading=12)
        rows.append([Paragraph(bar_text, bar_style)])
    t = Table(rows, colWidths=[12*cm])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    return t

# ─── Intervention card ────────────────────────────────────────────────────────
def intervention_card(item: dict, idx: int, styles: dict):
    """Returns a Table that looks like an intervention card."""
    axis   = item.get('axis', '')
    horizon = item.get('horizon', '')
    title  = item.get('title_he', '')
    what   = item.get('what_he', '')
    metric = item.get('metric_he', '')

    header_data = [[
        Paragraph(h(f'{idx}  {axis}  {horizon}'), styles['tag']),
    ]]
    content_data = [
        [p(title, styles['h3'])],
        [p(what,  styles['body'])],
        [p(f'מדד: {metric}', styles['metric'])],
    ]

    header_table = Table(header_data, colWidths=[15*cm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), SURFACE),
        ('ALIGN',        (0,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING',   (0,0), (-1,-1), 6),
        ('BOTTOMPADDING',(0,0), (-1,-1), 6),
        ('LEFTPADDING',  (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))

    content_table = Table(content_data, colWidths=[15*cm])
    content_table.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), colors.HexColor('#162032')),
        ('ALIGN',        (0,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING',   (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ('LEFTPADDING',  (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW',    (0,1), (-1,1), 0.3, BORDER),
    ]))

    outer = Table([[header_table], [content_table]], colWidths=[15*cm])
    outer.setStyle(TableStyle([
        ('BOX',          (0,0), (-1,-1), 1, BORDER),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
        ('LEFTPADDING',  (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('LINEABOVE',    (0,0), (-1,0), 2.5, ACCENT),
    ]))
    return outer

# ─── Main generator ───────────────────────────────────────────────────────────
def generate(data: dict) -> bytes:
    buf = io.BytesIO()
    styles = make_styles()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title=f"COR-SYS Diagnostic — {data.get('clientName', '')}",
    )

    story = []
    W = A4[0] - 4*cm  # usable width

    profile     = data.get('profile', 'at-risk')
    ptype       = data.get('pathologyType', '')
    ptype_label = data.get('pathologyTypeLabel', '')
    profile_col = PROFILE_COLORS.get(profile, ACCENT)
    profile_label = PROFILE_LABELS_HE.get(profile, profile)

    # ── Header ────────────────────────────────────────────────────────────────
    header_data = [[
        Paragraph(h('COR-SYS · דוח אבחון ארגוני'), ParagraphStyle(
            'brand', fontName='Hebrew-Bold', fontSize=10,
            textColor=ACCENT, alignment=TA_RIGHT, leading=14)),
        Paragraph(h(datetime.now().strftime('%d.%m.%Y')), ParagraphStyle(
            'date', fontName='Hebrew', fontSize=9,
            textColor=MUTED, alignment=TA_LEFT, leading=14)),
    ]]
    header_t = Table(header_data, colWidths=[W*0.75, W*0.25])
    header_t.setStyle(TableStyle([
        ('ALIGN',        (0,0), (0,0), 'RIGHT'),
        ('ALIGN',        (1,0), (1,0), 'LEFT'),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
    ]))
    story.append(header_t)
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER, spaceAfter=12))

    # ── Client name ───────────────────────────────────────────────────────────
    story.append(p(data.get('clientName', ''), styles['h1']))
    story.append(Spacer(1, 4))

    # ── Profile card ──────────────────────────────────────────────────────────
    profile_header = Table([[
        Paragraph(h('פרופיל שזוהה'), styles['h3']),
        Paragraph(
            h(f'{data.get("confidence", "")}% match · embedding' if data.get('confidence') else ''),
            styles['mono']),
    ]], colWidths=[W*0.7, W*0.3])
    profile_header.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,0), 'RIGHT'),
        ('ALIGN', (1,0), (1,0), 'LEFT'),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 4),
    ]))

    scores = data.get('scores', {})
    scores_data = [[
        Paragraph(h(f'DR  {scores.get("dr", 0):.1f}'), ParagraphStyle('s', fontName='Hebrew-Bold',
            fontSize=11, textColor=colors.HexColor('#ef4444'), alignment=TA_CENTER, leading=14)),
        Paragraph(h(f'ND  {scores.get("nd", 0):.1f}'), ParagraphStyle('s', fontName='Hebrew-Bold',
            fontSize=11, textColor=colors.HexColor('#eab308'), alignment=TA_CENTER, leading=14)),
        Paragraph(h(f'UC  {scores.get("uc", 0):.1f}'), ParagraphStyle('s', fontName='Hebrew-Bold',
            fontSize=11, textColor=colors.HexColor('#6366f1'), alignment=TA_CENTER, leading=14)),
        Paragraph(h(f'{ptype}  {ptype_label}'), ParagraphStyle('s', fontName='Hebrew-Bold',
            fontSize=9, textColor=WHITE, alignment=TA_RIGHT, leading=14)),
    ]]
    scores_t = Table(scores_data, colWidths=[W*0.15, W*0.15, W*0.15, W*0.55])
    scores_t.setStyle(TableStyle([
        ('ALIGN',        (0,0), (2,0), 'CENTER'),
        ('ALIGN',        (3,0), (3,0), 'RIGHT'),
        ('VALIGN',       (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
    ]))

    profile_card_content = [
        [profile_header],
        [Paragraph(h(profile_label), ParagraphStyle('ph', fontName='Hebrew-Bold',
            fontSize=20, textColor=profile_col, alignment=TA_RIGHT, leading=26))],
        [scores_t],
    ]

    # Add TAM if available
    tam = data.get('tam')
    if tam:
        profile_card_content.append([tam_bar_table(tam, styles)])

    # ROI row
    roi = data.get('roi', 0)
    team_size = data.get('teamSize', 0)
    hourly_rate = data.get('hourlyRate', 0)
    if roi > 0:
        roi_text = f'חיסכון פוטנציאלי: ₪{roi:,.0f} לשנה'
        roi_sub  = f'{team_size} עובדים × {hourly_rate} ₪/שעה × 52 שבועות · לפי גרנטיית COR-SYS'
        profile_card_content.append([p(roi_text, styles['roi'])])
        profile_card_content.append([p(roi_sub, styles['body'])])

    profile_card = Table(profile_card_content, colWidths=[W])
    profile_card.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,-1), SURFACE),
        ('BOX',          (0,0), (-1,-1), 0.5, BORDER),
        ('LINEABOVE',    (0,0), (-1,0), 3, profile_col),
        ('TOPPADDING',   (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0), (-1,-1), 8),
        ('LEFTPADDING',  (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(profile_card)
    story.append(Spacer(1, 14))

    # ── Protocol ──────────────────────────────────────────────────────────────
    protocol = data.get('protocol', {})
    if protocol:
        story.append(p('פרוטוקול מומלץ', styles['h3']))
        story.append(p(protocol.get('protocol', ''), styles['h2']))
        story.append(p(f'מדד הצלחה: {protocol.get("successKpi", "")}', styles['metric']))
        story.append(Spacer(1, 10))

    # ── Action plan ───────────────────────────────────────────────────────────
    plan = data.get('plan', [])
    if plan:
        story.append(p(f'תוכנית פעולה · {len(plan)} התערבויות', styles['h3']))
        story.append(Spacer(1, 4))
        for i, item in enumerate(plan):
            story.append(intervention_card(item, i + 1, styles))
            story.append(Spacer(1, 6))

    # ── Comorbidity cascade ───────────────────────────────────────────────────
    comorbidities = data.get('comorbidities', [])
    if comorbidities:
        story.append(Spacer(1, 6))
        story.append(p('פתולוגיות משניות בסיכון — cascade', styles['h3']))
        for c in comorbidities:
            cascade_label = h(f'{ptype} → {c.get("downstream", "")}')
            cascade_risk  = h(c.get('risk_he', ''))
            row = Table([[
                Paragraph(cascade_label, ParagraphStyle('cl', fontName='Hebrew-Bold',
                    fontSize=8, textColor=AMBER, alignment=TA_RIGHT, leading=12)),
                Paragraph(cascade_risk, ParagraphStyle('cr', fontName='Hebrew',
                    fontSize=8, textColor=MUTED, alignment=TA_RIGHT, leading=12)),
            ]], colWidths=[W*0.25, W*0.75])
            row.setStyle(TableStyle([
                ('ALIGN',        (0,0), (0,0), 'RIGHT'),
                ('ALIGN',        (1,0), (1,0), 'RIGHT'),
                ('TOPPADDING',   (0,0), (-1,-1), 3),
                ('BOTTOMPADDING',(0,0), (-1,-1), 3),
                ('LINEBELOW',    (0,0), (-1,-1), 0.3, BORDER),
            ]))
            story.append(row)

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER, spaceBefore=4, spaceAfter=6))
    story.append(p('COR-SYS · Conservation of Resources + Systemic Intervention', styles['mono']))
    story.append(p('מסמך זה מיועד לשימוש פנימי ארגוני בלבד', styles['body']))

    doc.build(story)
    return buf.getvalue()

# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    raw = sys.stdin.read()
    data = json.loads(raw)
    pdf_bytes = generate(data)
    sys.stdout.buffer.write(pdf_bytes)
