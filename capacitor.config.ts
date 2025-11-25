import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.flexflow.app',
  appName: 'FlexFlow',
  webDir: 'dist/public',
  server: {
    iosScheme: 'https',
    hostname: '816ceb24-1199-437b-af9a-e39baf99ff33-00-2fffvdsrov5is.riker.replit.dev',
    androidScheme: 'https'
  },
  plugins: {
    SubscriptionPlugin: {}
  }
}

export default config