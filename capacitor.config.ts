import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgetapp.mvp',
  appName: 'Spendly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
