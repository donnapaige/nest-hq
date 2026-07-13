import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesthq.app',
  appName: 'Nest HQ',
  webDir: 'public',
  server: {
    url: 'https://nest-hq.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
