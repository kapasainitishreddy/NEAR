// Rotating "devil's advocate" prompts that pressure-test a decision. Purely
// local prompt templates — they ask better questions, they don't give answers.
export const DEVIL_PROMPTS = [
  'What’s the strongest case for the opposite choice?',
  'What would you tell a close friend who made this exact decision?',
  'If this goes wrong, what will the reason most likely be?',
  'Are you solving the real problem, or just the urgent one?',
  'Whose opinion are you afraid of here — and should you be?',
  'What would the calmest version of you decide?',
  'Will this still feel right in a year? In five?',
  'What are you assuming that might not be true?',
  'What’s the cost of doing nothing at all?',
  'Are you moving toward something, or away from discomfort?',
  'If money or fear weren’t a factor, would you choose differently?',
  'What information would change your mind — and can you get it?',
]

export function pickDevilPrompt(exclude) {
  const pool = DEVIL_PROMPTS.filter((p) => p !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}
