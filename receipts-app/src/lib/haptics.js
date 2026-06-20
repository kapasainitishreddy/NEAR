// Tactile + share helpers. On native (Capacitor) these use the device's
// haptic engine and OS share sheet; on the web they degrade gracefully
// (Vibration API where available, Web Share API, or a clipboard fallback).
// Everything is lazily imported so the web bundle stays lean.
import { Capacitor } from '@capacitor/core'

const isNative = () => Capacitor?.isNativePlatform?.() === true

// ---- Haptics --------------------------------------------------------------
export async function tapLight() {
  if (isNative()) {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
      await Haptics.impact({ style: ImpactStyle.Light })
      return
    } catch {
      /* plugin unavailable — fall through */
    }
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8)
}

export async function tapSuccess() {
  if (isNative()) {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics')
      await Haptics.notification({ type: NotificationType.Success })
      return
    } catch {
      /* fall through */
    }
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([10, 40, 10])
}

export async function tapWarning() {
  if (isNative()) {
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics')
      await Haptics.notification({ type: NotificationType.Warning })
      return
    } catch {
      /* fall through */
    }
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(30)
}

// ---- Share ----------------------------------------------------------------
// Returns 'shared' | 'copied' | 'failed' so callers can show the right toast.
export async function shareText({ title, text }) {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title, text })
      return 'shared'
    } catch {
      /* user may have cancelled, or plugin missing — try web paths */
    }
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (err) {
      // AbortError = user dismissed the sheet; treat as a no-op, not a failure.
      if (err?.name === 'AbortError') return 'shared'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
