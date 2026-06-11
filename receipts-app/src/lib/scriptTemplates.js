// ---------------------------------------------------------------------------
// Local, template-based "Panic Script" generator. No AI API required.
// Each category produces three editable tones: soft, direct, professional.
// Templates interpolate a few user-provided fields and degrade gracefully when
// optional fields are left blank.
// ---------------------------------------------------------------------------

// Helpers ------------------------------------------------------------------
const orName = (v, fallback) => (v && v.trim() ? v.trim() : fallback)
const clause = (v, lead = ' ') => (v && v.trim() ? `${lead}${v.trim()}` : '')
const sign = (name) => (name && name.trim() ? `\n\nThank you,\n${name.trim()}` : '\n\nThank you')

// Field definitions used by the generator form.
// ctx = the one-line situation; detail = optional specifics.
export const SCRIPT_FIELDS = {
  recipient: { label: 'Who is this for?', placeholder: 'e.g. Sarah, my landlord, the support team' },
  context: { label: 'What is the situation?', placeholder: 'One line — e.g. the heater in unit 4B has been broken for a week' },
  detail: { label: 'Any specifics? (optional)', placeholder: 'Dates, amounts, names, what you need by when…' },
  name: { label: 'Sign off as (optional)', placeholder: 'Your name' },
}

// Each category: { id, label, emoji, blurb, build({recipient, context, detail, name}) -> {soft, direct, professional} }
export const SCRIPT_CATEGORIES = [
  {
    id: 'apology',
    label: 'Apology',
    emoji: '🕊️',
    blurb: 'Own it cleanly without over-explaining.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI've been thinking about${clause(context, ' ')} and I'm really sorry. I know it affected you, and that matters to me.${clause(detail, ' ')} I'd like to make it right — please let me know how.${sign(name)}`,
        direct: `Hi ${to},\n\nI owe you an apology for${clause(context, ' ')}. That was on me.${clause(detail, ' ')} I'll do better, and I'm happy to fix what I can now.${sign(name)}`,
        professional: `Hi ${to},\n\nI want to acknowledge${clause(context, ' ')} and apologize for the impact it had.${clause(detail, ' ')} I take responsibility and am committed to ensuring it doesn't happen again. Please let me know how I can help resolve it.${sign(name)}`,
      }
    },
  },
  {
    id: 'boundary',
    label: 'Setting a boundary',
    emoji: '🛡️',
    blurb: 'Be kind and unmistakably clear.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI care about us, so I want to be honest.${clause(context, ' ')} isn't working for me right now.${clause(detail, ' ')} I hope you can understand — it's not about blame, it's about what I can carry.${sign(name)}`,
        direct: `Hi ${to},\n\nI need to be straight with you.${clause(context, ' ')} doesn't work for me.${clause(detail, ' ')} Going forward, I won't be able to continue with this. Thanks for respecting that.${sign(name)}`,
        professional: `Hi ${to},\n\nTo set clear expectations:${clause(context, ' ')} is outside what I'm able to take on.${clause(detail, ' ')} I want to be transparent so we're aligned. Happy to discuss alternatives that work for both of us.${sign(name)}`,
      }
    },
  },
  {
    id: 'refund',
    label: 'Refund request',
    emoji: '💳',
    blurb: 'Polite, factual, and hard to refuse.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI hope you can help me out.${clause(context, ' ')} didn't go as expected.${clause(detail, ' ')} Would it be possible to arrange a refund? I'd really appreciate it.${sign(name)}`,
        direct: `Hi ${to},\n\nI'd like a refund for${clause(context, ' ')}.${clause(detail, ' ')} Please process the refund to my original payment method and confirm once it's done.${sign(name)}`,
        professional: `Hi ${to},\n\nI'm writing to request a refund regarding${clause(context, ' ')}.${clause(detail, ' ')} As the product/service did not meet what was described, I'm requesting a full refund to my original payment method. Please confirm the timeline. Thank you for your help.${sign(name)}`,
      }
    },
  },
  {
    id: 'rent',
    label: 'Rent / landlord issue',
    emoji: '🏠',
    blurb: 'Document the problem and the ask.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI wanted to flag something at the unit.${clause(context, ' ')} has been an issue.${clause(detail, ' ')} Could we find a time to get it sorted? Thanks so much.${sign(name)}`,
        direct: `Hi ${to},\n\nI'm writing about${clause(context, ' ')}.${clause(detail, ' ')} Please let me know when this will be repaired. I'd appreciate an update within a few days.${sign(name)}`,
        professional: `Hi ${to},\n\nI'm writing to formally document${clause(context, ' ')}.${clause(detail, ' ')} Per the tenancy agreement, I'm requesting this be addressed and would appreciate written confirmation of when repairs will take place. Thank you.${sign(name)}`,
      }
    },
  },
  {
    id: 'extension',
    label: 'Professor extension',
    emoji: '🎓',
    blurb: 'Respectful, specific, and brief.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'Professor')
      return {
        soft: `Hi ${to},\n\nI hope you're well. I'm reaching out about${clause(context, ' ')}.${clause(detail, ' ')} Would a short extension be possible? I want to submit my best work. Thank you for considering it.${sign(name)}`,
        direct: `Hi ${to},\n\nI'm requesting an extension on${clause(context, ' ')}.${clause(detail, ' ')} Could I have a couple of extra days? I'll have it submitted by then. Thank you.${sign(name)}`,
        professional: `Dear ${to},\n\nI'm writing to request an extension for${clause(context, ' ')}.${clause(detail, ' ')} I understand the deadline's importance and would be grateful for a brief extension to ensure the quality of my submission. Please let me know if you need anything from me.${sign(name)}`,
      }
    },
  },
  {
    id: 'sick',
    label: 'Sick leave',
    emoji: '🤒',
    blurb: 'Short, clear, no over-sharing.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI'm not feeling well today${clause(context, ' — ')} and won't be able to come in.${clause(detail, ' ')} I'll rest up and keep you posted. Sorry for the short notice.${sign(name)}`,
        direct: `Hi ${to},\n\nI'm unwell and will be taking a sick day today${clause(context, ' — ')}.${clause(detail, ' ')} I'll follow up on anything urgent when I'm back.${sign(name)}`,
        professional: `Hi ${to},\n\nI'm writing to let you know I'm unwell and unable to work today${clause(context, ' — ')}.${clause(detail, ' ')} I'll ensure any time-sensitive items are handed off and will provide documentation if required. Thank you for understanding.${sign(name)}`,
      }
    },
  },
  {
    id: 'payment',
    label: 'Payment follow-up',
    emoji: '🧾',
    blurb: 'Firm, friendly, and on the record.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nJust a gentle nudge about${clause(context, ' ')}.${clause(detail, ' ')} Could you let me know when I can expect it? No worries if it slipped — happens to all of us!${sign(name)}`,
        direct: `Hi ${to},\n\nFollowing up on${clause(context, ' ')}, which is now outstanding.${clause(detail, ' ')} Please confirm the payment date. Thanks.${sign(name)}`,
        professional: `Hi ${to},\n\nThis is a follow-up regarding${clause(context, ' ')}, currently outstanding.${clause(detail, ' ')} I'd appreciate confirmation of the payment date at your earliest convenience. Please let me know if you need an updated invoice. Thank you.${sign(name)}`,
      }
    },
  },
  {
    id: 'support',
    label: 'Customer support complaint',
    emoji: '📣',
    blurb: 'Calm escalation that gets results.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'Support team')
      return {
        soft: `Hi ${to},\n\nI've run into a problem and I'm hoping you can help.${clause(context, ' ')}${clause(detail, ' ')} What are my options here? Thanks for looking into it.${sign(name)}`,
        direct: `Hi ${to},\n\nI'm not satisfied with${clause(context, ' ')}.${clause(detail, ' ')} I'd like this resolved and a clear next step. Please advise.${sign(name)}`,
        professional: `Hi ${to},\n\nI'm writing to formally raise an issue regarding${clause(context, ' ')}.${clause(detail, ' ')} I'd like to understand how this will be resolved and the expected timeline. If it can't be resolved at this level, please escalate. Thank you.${sign(name)}`,
      }
    },
  },
  {
    id: 'roommate',
    label: 'Roommate conflict',
    emoji: '🧹',
    blurb: 'Address the issue, protect the relationship.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hey ${to},\n\nCan we chat about something small?${clause(context, ' ')} has been on my mind.${clause(detail, ' ')} I'm not upset — I'd just love for us to be on the same page. Sound okay?${sign(name)}`,
        direct: `Hey ${to},\n\nI want to sort out${clause(context, ' ')}.${clause(detail, ' ')} Can we agree on how to handle it going forward? It'll make things easier for both of us.${sign(name)}`,
        professional: `Hi ${to},\n\nI'd like to find a fair arrangement around${clause(context, ' ')}.${clause(detail, ' ')} Could we set aside a few minutes to agree on shared expectations? I think a quick plan will help us both.${sign(name)}`,
      }
    },
  },
  {
    id: 'cancel',
    label: 'Canceling plans politely',
    emoji: '📅',
    blurb: 'Bow out warmly, no guilt spiral.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI'm so sorry to do this, but I need to cancel${clause(context, ' ')}.${clause(detail, ' ')} I really wanted to be there. Can we find another time soon?${sign(name)}`,
        direct: `Hi ${to},\n\nI won't be able to make${clause(context, ' ')} after all.${clause(detail, ' ')} Let's reschedule — what works for you next week?${sign(name)}`,
        professional: `Hi ${to},\n\nUnfortunately I need to cancel${clause(context, ' ')}.${clause(detail, ' ')} Apologies for any inconvenience. I'd welcome the chance to reschedule at a time that suits you.${sign(name)}`,
      }
    },
  },
  {
    id: 'clarify',
    label: 'Asking for clarification',
    emoji: '❓',
    blurb: 'Look sharp, not lost.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nQuick question to make sure I get this right.${clause(context, ' ')}${clause(detail, ' ')} Could you help me understand? Want to avoid any mix-ups. Thanks!${sign(name)}`,
        direct: `Hi ${to},\n\nBefore I move ahead, I want to confirm${clause(context, ' ')}.${clause(detail, ' ')} Can you clarify so I get it right the first time?${sign(name)}`,
        professional: `Hi ${to},\n\nTo ensure I deliver exactly what's expected, could you clarify${clause(context, ' ')}?${clause(detail, ' ')} A quick confirmation will help me proceed accurately. Thank you.${sign(name)}`,
      }
    },
  },
  {
    id: 'negotiate',
    label: 'Negotiating price',
    emoji: '🤝',
    blurb: 'Anchor calmly, leave room to land.',
    build: ({ recipient, context, detail, name }) => {
      const to = orName(recipient, 'there')
      return {
        soft: `Hi ${to},\n\nI really like what you're offering with${clause(context, ' ')}.${clause(detail, ' ')} Is there any flexibility on the price? I'd love to make this work.${sign(name)}`,
        direct: `Hi ${to},\n\nI'm interested in${clause(context, ' ')}, but the price is above my budget.${clause(detail, ' ')} Can we meet in the middle? I'm ready to move quickly if we can.${sign(name)}`,
        professional: `Hi ${to},\n\nThank you for the proposal regarding${clause(context, ' ')}.${clause(detail, ' ')} Based on my budget and comparable options, I'd like to discuss adjusting the price. I'm keen to find terms that work for both of us. What flexibility is available?${sign(name)}`,
      }
    },
  },
]

export function getCategory(id) {
  return SCRIPT_CATEGORIES.find((c) => c.id === id) || SCRIPT_CATEGORIES[0]
}

export function generateScript(categoryId, inputs) {
  const cat = getCategory(categoryId)
  return cat.build({
    recipient: inputs.recipient || '',
    context: inputs.context || '',
    detail: inputs.detail || '',
    name: inputs.name || '',
  })
}

export const TONES = [
  { id: 'soft', label: 'Soft', emoji: '🌿', hint: 'Warm and gentle' },
  { id: 'direct', label: 'Direct', emoji: '➡️', hint: 'Short and clear' },
  { id: 'professional', label: 'Professional', emoji: '💼', hint: 'Formal and measured' },
]
