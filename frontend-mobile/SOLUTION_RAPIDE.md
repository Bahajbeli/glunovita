# Solution Rapide - Erreur "Something went wrong"

## 🎯 Cause Probable

L'erreur "Something went wrong" dans Expo Go est souvent causée par :

1. **`react-native-maps`** - Cette dépendance native ne fonctionne PAS avec Expo Go
2. **Appel API au démarrage** - Le contexte Auth essaie de contacter le backend avec `localhost`

## ✅ Solution Immédiate

### Option 1 : Tester avec une version simplifiée

1. **Sauvegardez votre App.tsx actuel** :
```bash
cd frontend-mobile
cp App.tsx App.backup.tsx
```

2. **Utilisez la version de test** :
```bash
cp App.test.tsx App.tsx
```

3. **Redémarrez Expo** :
```bash
npx expo start --clear
```

4. **Testez dans Expo Go** :
   - Si ça fonctionne → Le problème vient du code de l'application
   - Si ça ne fonctionne pas → Problème de configuration Expo/Expo Go

### Option 2 : Corriger le problème avec react-native-maps

`react-native-maps` nécessite une configuration native et ne fonctionne pas avec Expo Go. Vous avez deux options :

#### A. Utiliser expo-maps (recommandé pour Expo Go)

```bash
npx expo install expo-maps
```

Puis remplacez dans `LocationScreen.tsx` et `BookConsultationScreen.tsx` :
```typescript
// Au lieu de :
import MapView, { Marker } from 'react-native-maps';

// Utilisez :
import { MapView, Marker } from 'expo-maps';
```

#### B. Désactiver temporairement les écrans avec maps

Commentez temporairement les imports de `MapView` pour tester si c'est la cause.

### Option 3 : Corriger l'URL de l'API

Le contexte Auth essaie de contacter `localhost:5000` au démarrage, ce qui ne fonctionne pas sur un appareil physique.

1. **Trouvez votre IP locale** :
```bash
ipconfig
# Cherchez "Adresse IPv4" sous votre connexion Wi-Fi
```

2. **Modifiez `src/config/api.ts`** :
```typescript
const API_URL = __DEV__ 
  ? 'http://192.168.1.XXX:5000/api' // Remplacez XXX par votre IP
  : 'https://your-production-api.com/api';
```

3. **Assurez-vous que le backend est accessible** :
   - Testez depuis votre téléphone : `http://VOTRE_IP:5000/api`
   - Vérifiez le pare-feu Windows

## 🔍 Diagnostic Étape par Étape

1. **Testez avec App.test.tsx** (version simplifiée)
2. **Si ça fonctionne**, restaurez App.tsx et testez progressivement :
   - D'abord sans le contexte Auth
   - Puis avec Auth mais sans les écrans Maps
   - Enfin avec tout

3. **Vérifiez les logs** :
   - Dans Expo Go : Secouez le téléphone → "Debug Remote JS"
   - Dans le terminal : Regardez les erreurs de compilation

## 📝 Prochaines Étapes

Une fois que vous avez identifié la cause :

1. **Si c'est react-native-maps** → Migrez vers expo-maps ou utilisez un développement build
2. **Si c'est l'API** → Configurez correctement l'URL avec votre IP locale
3. **Si c'est autre chose** → Partagez les logs d'erreur pour diagnostic

## 🚨 Important

**Expo Go a des limitations** :
- Certaines dépendances natives ne fonctionnent pas
- `react-native-maps` nécessite un développement build
- Pour une app complète, considérez `expo prebuild` + développement build
