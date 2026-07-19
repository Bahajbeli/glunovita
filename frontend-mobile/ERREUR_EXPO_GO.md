# Résolution des Erreurs Expo Go

## ✅ Corrections Appliquées

1. **Erreurs TypeScript corrigées** :
   - Ajout de `profileQuestions` dans l'interface `User`
   - Ajout des imports manquants (`TextInput`, `ScrollView`)
   - Mise à jour de React Native vers la version compatible (0.73.6)

2. **Configuration app.json améliorée** :
   - Suppression des références aux assets manquants
   - Ajout du schéma d'application

## 🔧 Étapes pour Résoudre l'Erreur

### 1. Redémarrer avec cache nettoyé

```bash
cd frontend-mobile
npx expo start --clear
```

### 2. Vérifier que le backend est démarré

```bash
cd ../backend
npm run dev
```

### 3. Configurer l'URL de l'API pour votre appareil

Ouvrez `src/config/api.ts` et remplacez `localhost` par votre IP locale :

```typescript
const API_URL = __DEV__ 
  ? 'http://192.168.1.XXX:5000/api' // Remplacez XXX par votre IP locale
  : 'https://your-production-api.com/api';
```

Pour trouver votre IP locale :
- Windows : `ipconfig` dans PowerShell
- Cherchez "Adresse IPv4" sous votre connexion Wi-Fi

### 4. Vérifier la connexion réseau

- Assurez-vous que votre téléphone et votre ordinateur sont sur le **même réseau Wi-Fi**
- Désactivez temporairement le pare-feu Windows si nécessaire
- Testez l'accès au backend depuis votre téléphone : `http://VOTRE_IP:5000/api`

### 5. Mettre à jour Expo Go

- Assurez-vous d'avoir la dernière version d'Expo Go depuis l'App Store / Play Store

### 6. Si l'erreur persiste

Partagez le message d'erreur exact que vous voyez dans Expo Go pour un diagnostic précis.

## 📱 Messages d'Erreur Courants

### "Unable to resolve module"
```bash
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

### "Network request failed"
- Vérifiez l'URL de l'API dans `src/config/api.ts`
- Utilisez votre IP locale au lieu de `localhost`
- Vérifiez que le backend est accessible

### "Cannot connect to Metro bundler"
```bash
npx expo start --clear --reset-cache
```

## 🆘 Besoin d'Aide ?

Si le problème persiste, partagez :
1. Le message d'erreur exact dans Expo Go
2. Les logs du terminal où `npm start` est lancé
3. Votre configuration réseau (IP locale utilisée)
