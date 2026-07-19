// Version de test simplifiée pour diagnostiquer le problème
// Renommez ce fichier en App.tsx temporairement pour tester

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Expo Go fonctionne !</Text>
      <Text style={styles.subtext}>Si vous voyez ce message, le problème vient du code de l'application.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#14b8a6',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
