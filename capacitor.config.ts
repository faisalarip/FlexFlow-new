import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.flexflow.app',
  appName: 'FlexFlow',
  webDir: 'dist/public',
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https'
  },
  plugins: {
    SubscriptionPlugin: {}
  },
  packageClassList: [
    'StatusBarPlugin',
    'SubscriptionPlugin'
  ]
}

export default config