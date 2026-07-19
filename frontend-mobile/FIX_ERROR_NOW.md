# 🔧 Solution Immédiate - Erreur "Something went wrong"

## ⚠️ Cause Identifiée

L'erreur est causée par **`react-native-maps`** qui **ne fonctionne PAS** avec Expo Go.

## ✅ Solution en 3 Étapes (5 minutes)

### Étape 1 : Remplacer BookConsultationScreen

```bash
cd frontend-mobile

# Sauvegardez l'original
cp src/screens/patient/BookConsultationScreen.tsx src/screens/patient/BookConsultationScreen.original.tsx

# Utilisez la version sans maps
cp src/screens/patient/BookConsultationScreen.expo.tsx src/screens/patient/BookConsultationScreen.tsx
```

### Étape 2 : Remplacer LocationScreen

```bash
# Sauvegardez l'original
cp src/screens/doctor/LocationScreen.tsx src/screens/doctor/LocationScreen.original.tsx

# Utilisez la version sans maps
cp src/screens/doctor/LocationScreen.expo.tsx src/screens/doctor/LocationScreen.tsx
```

### Étape 3 : Redémarrer Expo

```bash
# Arrêtez le serveur actuel (Ctrl+C)
# Puis redémarrez avec cache nettoyé
npx expo start --clear
```

## 🎯 Testez Maintenant

1. Scannez le QR code dans Expo Go
2. L'application devrait maintenant fonctionner ✅

## 📋 Vérification

Si ça fonctionne, vous verrez :
- ✅ L'écran de login
- ✅ Les écrans sans erreur
- ⚠️ Les écrans avec maps afficheront un message indiquant que la carte n'est pas disponible

## 🔄 Pour Restaurer Plus Tard

Si vous voulez restaurer les versions originales avec maps :

```bash
cp src/screens/patient/BookConsultationScreen.original.tsx src/screens/patient/BookConsultationScreen.tsx
cp src/screens/doctor/LocationScreen.original.tsx src/screens/doctor/LocationScreen.tsx
```

## 🚀 Solution Permanente (Pour Plus Tard)

Pour utiliser les vraies cartes, vous devrez :

1. **Créer un développement build** :
   ```bash
   npx expo prebuild
   npx expo run:android  # ou run:ios
   ```

2. **Ou utiliser expo-maps** (si disponible pour votre version d'Expo)

## ❓ Si l'Erreur Persiste

1. **Testez avec App.test.tsx** :
   ```bash
   cp App.test.tsx App.tsx
   npx expo start --clear
   ```
   
   - Si ça fonctionne → Le problème vient du code
   - Si ça ne fonctionne pas → Problème Expo Go / Configuration

2. **Vérifiez les logs** :
   - Dans Expo Go : Secouez le téléphone → "Debug Remote JS"
   - Dans le terminal : Regardez les erreurs de compilation

3. **Partagez** :
   - Le message d'erreur exact
   - Les logs du terminal
