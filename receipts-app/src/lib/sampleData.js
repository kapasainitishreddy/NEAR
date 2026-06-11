// Demo content. Loaded once on first run (and re-loadable from Settings).
// Every item is tagged `demo: true` so it can be cleanly removed later.
import { generateScript } from './scriptTemplates.js'

const iso = (daysFromNow = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}

export function buildSampleScripts() {
  const landlord = generateScript('rent', {
    recipient: 'my landlord',
    context: 'the leaking tap in the bathroom',
    detail: 'It has been dripping for over a week and is staining the floor.',
    name: 'Alex',
  })
  const prof = generateScript('extension', {
    recipient: 'Professor Lee',
    context: 'the Week 9 essay due Friday',
    detail: 'I had a family emergency earlier this week and lost two working days.',
    name: 'Alex',
  })
  return [
    {
      id: 'demo_script_landlord',
      type: 'script',
      demo: true,
      title: 'Ask landlord about repair',
      categoryId: 'rent',
      inputs: {
        recipient: 'my landlord',
        context: 'the leaking tap in the bathroom',
        detail: 'It has been dripping for over a week and is staining the floor.',
        name: 'Alex',
      },
      versions: landlord,
      tone: 'professional',
      content: landlord.professional,
      status: 'draft',
      favorite: true,
      reviewDate: '',
      createdAt: iso(-4),
      updatedAt: iso(-4),
    },
    {
      id: 'demo_script_prof',
      type: 'script',
      demo: true,
      title: 'Professor extension request',
      categoryId: 'extension',
      inputs: {
        recipient: 'Professor Lee',
        context: 'the Week 9 essay due Friday',
        detail: 'I had a family emergency earlier this week and lost two working days.',
        name: 'Alex',
      },
      versions: prof,
      tone: 'soft',
      content: prof.soft,
      status: 'sent',
      favorite: false,
      reviewDate: iso(2),
      createdAt: iso(-2),
      updatedAt: iso(-1),
    },
  ]
}

export function buildSampleDecisions() {
  return [
    {
      id: 'demo_decision_apartment',
      type: 'decision',
      demo: true,
      title: 'Why I chose Apartment B',
      finalDecision: 'Signed the lease on Apartment B near the river.',
      optionsConsidered: 'Apartment A (cheaper, longer commute), Apartment B (pricier, walkable), staying put',
      mainReason: 'A 12-minute walk to work protects my mornings and my mood.',
      pros: 'Walkable, quiet street, good light, in-unit laundry',
      cons: 'About $180/mo more than Apartment A',
      risks: 'Budget is tighter; less savings buffer each month',
      feelings: 'Nervous about the cost but genuinely excited and calm about the location.',
      evidence: 'Tracked my commute stress for two weeks — short commute days were clearly better.',
      influencedBy: 'A long talk with my sister, who reminded me what drains me.',
      changeMind: 'If my income dropped or the building had noise issues at night.',
      futureMeNote: 'Future me: you chose your peace over a small saving. Protect that morning walk.',
      category: 'Housing',
      status: 'reviewed',
      favorite: true,
      reviewDate: iso(30),
      createdAt: iso(-20),
      updatedAt: iso(-3),
    },
    {
      id: 'demo_decision_impulse',
      type: 'decision',
      demo: true,
      title: 'Why I paused an impulse purchase',
      finalDecision: 'Did NOT buy the $240 headphones. Added to a 30-day wishlist instead.',
      optionsConsidered: 'Buy now, wait 30 days, buy a cheaper pair',
      mainReason: 'The urge was about a bad day, not about needing headphones.',
      pros: 'Kept my savings goal on track; tested whether I actually want them',
      cons: 'Might miss the current sale price',
      risks: 'Low — I already own working headphones',
      feelings: 'A little FOMO, but mostly proud and clear-headed.',
      evidence: 'My current pair works fine. Last 3 "sale" buys are barely used.',
      influencedBy: 'My own rule: do not shop to fix a feeling.',
      changeMind: 'If after 30 days I still want them and the budget allows it.',
      futureMeNote: 'Future me: if you forgot about these, that was the right call.',
      category: 'Money',
      status: 'resolved',
      favorite: false,
      reviewDate: iso(25),
      createdAt: iso(-6),
      updatedAt: iso(-6),
    },
  ]
}

export function buildSampleRules() {
  return [
    {
      id: 'demo_rule_angry',
      type: 'rule',
      demo: true,
      text: 'Do not reply when angry.',
      note: 'Draft it, save it, sleep on it. Send in the morning if it still feels right.',
      createdAt: iso(-15),
      updatedAt: iso(-15),
    },
    {
      id: 'demo_rule_feeling',
      type: 'rule',
      demo: true,
      text: 'Do not shop to fix a feeling.',
      note: 'A bad day is not a buy signal.',
      createdAt: iso(-15),
      updatedAt: iso(-15),
    },
  ]
}
