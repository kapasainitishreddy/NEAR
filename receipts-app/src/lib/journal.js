// Generates a printable "Decision Journal" — opens a clean, typeset document and
// triggers the print dialog, where the user can Save as PDF. No dependencies.
import { fmtDate } from './format.js'
import { outcomeMeta } from './constants.js'

const FIELDS = [
  ['finalDecision', 'Final decision'],
  ['optionsConsidered', 'Options considered'],
  ['mainReason', 'Main reason'],
  ['pros', 'Pros'],
  ['cons', 'Cons'],
  ['risks', 'Risks'],
  ['feelings', 'Feelings at the time'],
  ['premortem', 'Pre-mortem'],
  ['futureMeNote', 'Note to future me'],
]

function esc(s = '') {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}

function decisionHtml(d) {
  const rows = FIELDS.filter(([k]) => d[k])
    .map(
      ([k, label]) =>
        `<div class="field"><div class="lbl">${label}</div><div class="val">${esc(d[k]).replace(/\n/g, '<br>')}</div></div>`
    )
    .join('')
  const out = outcomeMeta(d.outcome)
  const meta = [d.category, d.createdAt ? fmtDate(d.createdAt) : '', out ? `Outcome: ${out.label}` : '']
    .filter(Boolean)
    .join(' · ')
  return `<section class="entry"><h2>${esc(d.title || 'Untitled decision')}</h2><div class="meta">${esc(meta)}</div>${rows}</section>`
}

export function exportJournal({ decisions = [], rules = [], name = '' } = {}) {
  const w = window.open('', '_blank')
  if (!w) return false

  const ordered = decisions
    .slice()
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))

  const rulesHtml = rules.length
    ? `<section class="entry rules"><h2>My rules</h2>${rules
        .map((r) => `<div class="rule">— ${esc(r.text)}${r.note ? `<span class="note"> (${esc(r.note)})</span>` : ''}</div>`)
        .join('')}</section>`
    : ''

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Decision Journal</title>
<style>
  @page { margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.5; }
  .cover { text-align:center; padding: 30vh 0 10vh; page-break-after: always; }
  .cover .mark { font: 600 13px ui-monospace, monospace; letter-spacing:.3em; color:#9a7b2e; }
  .cover h1 { font-size: 40px; margin: 10px 0 6px; }
  .cover p { color:#666; }
  .entry { page-break-inside: avoid; margin-bottom: 26px; padding-bottom: 18px; border-bottom: 1px solid #e6e2d6; }
  h2 { font-size: 22px; margin: 0 0 2px; }
  .meta { font: 12px ui-monospace, monospace; color:#9a7b2e; margin-bottom: 12px; text-transform: uppercase; letter-spacing:.05em; }
  .field { margin: 8px 0; }
  .lbl { font: 600 11px ui-monospace, monospace; text-transform: uppercase; letter-spacing:.08em; color:#999; }
  .val { margin-top: 2px; }
  .rule { margin: 6px 0; font-size: 16px; }
  .note { color:#888; font-style: italic; }
  .foot { text-align:center; color:#aaa; font-size:11px; margin-top:30px; }
</style></head><body>
  <div class="cover">
    <div class="mark">PERSONAL DECISION JOURNAL</div>
    <h1>${name ? esc(name) + '’s Decisions' : 'My Decisions'}</h1>
    <p>${ordered.length} decision${ordered.length === 1 ? '' : 's'} · exported ${fmtDate(new Date().toISOString())}</p>
  </div>
  ${rulesHtml}
  ${ordered.map(decisionHtml).join('')}
  <div class="foot">Kept privately with Receipts.</div>
</body></html>`

  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  const fire = () => {
    try {
      w.print()
    } catch {
      /* user can print manually */
    }
  }
  // give fonts/layout a beat
  if (w.document.readyState === 'complete') setTimeout(fire, 400)
  else w.onload = () => setTimeout(fire, 400)
  return true
}
