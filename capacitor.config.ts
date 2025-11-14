import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.flexflow.app',
  appName: 'FlexFlow',
  webDir: 'dist/public',
  server: {
    iosScheme: 'https'
  }
}

export default config