import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kapasainitishreddy.receipts',
  appName: 'Receipts',
  webDir: 'dist',
  backgroundColor: '#0a0f1d',
  plugins: {
    SplashScreen: {
      launchShowDuration: 700,
      backgroundColor: '#0a0f1d',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
  },
}

export default config
