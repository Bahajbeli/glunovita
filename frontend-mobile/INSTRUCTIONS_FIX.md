# Instructions pour Corriger l'Erreur Expo Go

## 🎯 Cause Identifiée

L'erreur "Something went wrong" est très probablement causée par **`react-native-maps`** qui ne fonctionne **PAS** avec Expo Go.

## ✅ Solution Rapide (3 étapes)

### Étape 1 : Tester avec une version simplifiée

```bash
cd frontend-mobile

# Sauvegardez votre App.tsx
cp App.tsx App.original.tsx

# Utilisez la version de test
cp App.test.tsx App.tsx

# Redémarrez
npx expo start --clear
```

**Testez dans Expo Go** :
- ✅ Si ça fonctionne → Le problème vient du code
- ❌ Si ça ne fonctionne pas → Problème Expo Go / Configuration

### Étape 2 : Si le test fonctionne, remplacez les écrans avec maps

```bash
# Restaurez App.tsx
cp App.original.tsx App.tsx

# Remplacez LocationScreen
cp src/screens/doctor/LocationScreen.expo.tsx src/screens/doctor/LocationScreen.tsx

# Pour BookConsultationScreen, commentez temporairement la partie map
```

### Étape 3 : Corriger BookConsultationScreen

Ouvrez `src/screens/patient/BookConsultationScreen.tsx` et commentez les imports et l'utilisation de `MapView` :

```typescript
// Commentez cette ligne :
// import MapView, { Marker } from 'react-native-maps';

// Et remplacez la section map par :
<View style={styles.mapPlaceholder}>
  <Text>La carte n'est pas disponible dans Expo Go</Text>
  <Text>Utilisez la liste des docteurs ci-dessous</Text>
</View>
```

## 🔄 Solution Permanente

Pour utiliser les vraies cartes, vous avez deux options :

### Option A : Utiliser expo-maps (recommandé)

```bash
npx expo install expo-maps
```

Puis remplacez dans les fichiers :
```typescript
// Au lieu de :
import MapView, { Marker } from 'react-native-maps';

// Utilisez :
import { MapView, Marker } from 'expo-maps';
```

### Option B : Créer un développement build

```bash
npx expo prebuild
npx expo run:android  # ou run:ios
```

Cela créera un build natif qui supporte `react-native-maps`.

## 📋 Checklist de Vérification

- [ ] Testé avec App.test.tsx → Fonctionne ?
- [ ] Remplacé LocationScreen par la version sans maps
- [ ] Commenté MapView dans BookConsultationScreen
- [ ] Configuré l'URL API avec votre IP locale
- [ ] Backend démarré et accessible
- [ ] Redémarré Expo avec `--clear`

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs** :
   - Dans Expo Go : Secouez → "Debug Remote JS"
   - Dans le terminal : Regardez les erreurs

2. **Partagez** :
   - Le message d'erreur exact
   - Les logs du terminal
   - La version d'Expo Go

3. **Testez progressivement** :
   - D'abord sans AuthContext
   - Puis avec AuthContext mais sans maps
   - Enfin avec tout
