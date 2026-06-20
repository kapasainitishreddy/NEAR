// On-device text-to-speech via the Web Speech Synthesis API. No network: the
// browser/OS does the synthesis. Used for "Listen" (read a script aloud) and
// the voice options in Settings.
export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Voices can load asynchronously; resolve once they're available.
export function loadVoices() {
  return new Promise((resolve) => {
    if (!speechSupported()) return resolve([])
    const existing = window.speechSynthesis.getVoices()
    if (existing.length) return resolve(existing)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener?.('voiceschanged', finish, { once: true })
    setTimeout(finish, 800) // fallback if the event never fires
  })
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

// Speaks text; returns a cleanup/stop function. onend fires when finished.
export function speak(text, { voiceURI, rate = 1, pitch = 1, onend } = {}) {
  if (!speechSupported() || !text?.trim()) {
    onend?.()
    return () => {}
  }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = Math.max(0.5, Math.min(2, rate))
  u.pitch = pitch
  if (voiceURI) {
    const v = window.speechSynthesis.getVoices().find((x) => x.voiceURI === voiceURI)
    if (v) u.voice = v
  }
  if (onend) {
    u.onend = onend
    u.onerror = onend
  }
  window.speechSynthesis.speak(u)
  return () => window.speechSynthesis.cancel()
}
