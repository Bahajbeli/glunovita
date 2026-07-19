# Étapes de Debug pour l'Erreur Expo Go

## 🔍 Diagnostic Immédiat

### 1. Voir les Logs d'Erreur Détaillés

Dans Expo Go, cliquez sur **"View error log"** et partagez le message d'erreur complet.

### 2. Vérifier les Logs Metro Bundler

Dans le terminal où vous avez lancé `npm start`, vérifiez s'il y a des erreurs de compilation.

### 3. Test Simple - Vérifier que l'App se Charge

Créez temporairement un fichier `App.tsx` simplifié pour tester :

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Test Expo Go</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

Si ça fonctionne, le problème vient du code de l'application.

## 🛠️ Solutions Courantes

### Solution 1 : Nettoyer et Réinstaller

```bash
cd frontend-mobile
rm -rf node_modules
npm cache clean --force
npm install --legacy-peer-deps
npx expo start --clear
```

### Solution 2 : Vérifier les Dépendances Natives

Les dépendances natives comme `react-native-maps` et `expo-location` peuvent causer des problèmes.

Temporairement, commentez les imports de ces dépendances pour tester :

Dans `LocationScreen.tsx` et `BookConsultationScreen.tsx`, commentez temporairement les imports de `react-native-maps`.

### Solution 3 : Vérifier la Configuration Expo

Assurez-vous que `app.json` est valide :

```bash
npx expo config --type public
```

### Solution 4 : Vérifier la Version d'Expo Go

- Mettez à jour Expo Go sur votre téléphone
- Ou utilisez une version compatible d'Expo dans `package.json`

## 📋 Informations à Partager

Pour un diagnostic précis, partagez :

1. **Le message d'erreur complet** depuis "View error log" dans Expo Go
2. **Les logs du terminal** où `npm start` est lancé
3. **La version d'Expo Go** sur votre téléphone
4. **Le système d'exploitation** de votre téléphone (iOS/Android)

## 🚨 Erreurs Communes et Solutions

### "Unable to resolve module"
→ Problème d'imports ou dépendances manquantes

### "Cannot read property of undefined"
→ Problème avec le contexte Auth ou la navigation

### "Network request failed"
→ Problème de connexion au backend ou URL API incorrecte

### Erreur de compilation TypeScript
→ Vérifiez avec `npx tsc --noEmit`
