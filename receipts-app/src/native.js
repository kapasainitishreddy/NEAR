// Native-only enhancements. On the web these are no-ops, so the same build
// runs as a PWA in the browser and as a native app via Capacitor.
import { Capacitor } from '@capacitor/core'

export async function initNative() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    // Style.Dark = light text, which suits our dark navy background.
    await StatusBar.setStyle({ style: Style.Dark })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0a0f1d' })
    }
  } catch {
    /* status bar plugin unavailable — ignore */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    /* splash plugin unavailable — ignore */
  }

  // Deep links — let Siri Shortcuts / other apps jump straight to an action:
  //   receipts://new      → new decision receipt
  //   receipts://script   → new panic script
  //   receipts://insights → insights
  try {
    const { App } = await import('@capacitor/app')
    App.addListener('appUrlOpen', ({ url }) => {
      const action = String(url || '').split('://')[1]?.replace(/\/+$/, '') || ''
      const route = { new: '/receipt', receipt: '/receipt', script: '/script', insights: '/insights' }[action]
      if (route) window.location.hash = `#${route}`
    })
  } catch {
    /* app plugin unavailable — ignore */
  }
}
