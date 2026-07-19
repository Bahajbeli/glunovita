export default {
  expo: {
    name: 'Glunovita',
    slug: 'glunovita-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#14b8a6',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.glunovita.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#14b8a6',
      },
      package: 'com.glunovita.app',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    plugins: ['expo-location'],
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:5000/api',
    },
  },
};
