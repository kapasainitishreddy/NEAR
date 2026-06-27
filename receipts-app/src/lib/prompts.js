// A daily reflection prompt — deterministic by calendar day so everyone sees a
// stable "question of the day" that rotates each morning.
export const REFLECTION_PROMPTS = [
  'What decision are you avoiding right now — and why?',
  'What would the calmest version of you do today?',
  'What’s one small choice you can feel good about today?',
  'Is there a “maybe” in your life that’s really a no?',
  'What are you tolerating that you could change?',
  'Whose opinion are you letting weigh too much?',
  'What would you do if you weren’t afraid of looking foolish?',
  'What did past-you get right that you can trust again?',
  'What’s a decision you keep remaking? What’s underneath it?',
  'If money weren’t a factor, what would you choose?',
  'What boundary do you need to say out loud this week?',
  'What’s the kindest true thing you could tell yourself today?',
  'What would “future you, one year from now” thank you for?',
  'What are you pretending not to know?',
  'What’s one thing you can stop overthinking right now?',
  'When did you last change your mind? What changed it?',
  'What does your gut already know about a current choice?',
  'What’s a risk worth taking while it’s still reversible?',
  'What would you advise a friend in your exact situation?',
  'What’s draining you that you have the power to end?',
  'What decision, made today, would make tomorrow easier?',
  'Where are you choosing comfort over growth?',
  'What’s the story you’re telling yourself — is it true?',
  'What would “enough” look like for you this week?',
  'What are you grateful you decided, looking back?',
  'What’s one promise to yourself you can keep today?',
  'What’s the cost of waiting on the thing you’re weighing?',
  'What matters most to you in the choice in front of you?',
  'What would you do if you fully trusted yourself?',
  'What’s a tiny experiment that could settle a big question?',
]

export function dailyPrompt(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86400000)
  return REFLECTION_PROMPTS[((dayIndex % REFLECTION_PROMPTS.length) + REFLECTION_PROMPTS.length) % REFLECTION_PROMPTS.length]
}
