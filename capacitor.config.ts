import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myprogress.app',
  appName: 'MyProgress',
  webDir: 'dist',
  server: {
    // Clear android assets on every sync to prevent corruption/duplication
    androidScheme: 'https'
  }
};

export default config;
