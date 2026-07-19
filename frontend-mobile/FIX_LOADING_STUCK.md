# 🔧 Correction - Page Bloquée sur le Chargement

## 🎯 Problème Identifié

La page reste bloquée sur l'écran de chargement car :
- Le contexte Auth essaie de contacter l'API au démarrage
- L'API n'est pas accessible (localhost sur appareil physique)
- Pas de timeout, donc l'app reste bloquée indéfiniment

## ✅ Corrections Appliquées

1. **Timeout ajouté** : L'app ne restera plus bloquée plus de 5 secondes
2. **Gestion d'erreur améliorée** : Si l'API n'est pas accessible, l'app continue quand même
3. **Timeout API** : 10 secondes pour toutes les requêtes API

## 🚀 Actions Immédiates

### 1. Redémarrer Expo

```bash
cd frontend-mobile
npx expo start --clear
```

### 2. Configurer l'URL de l'API

**IMPORTANT** : Pour que l'app fonctionne sur un appareil physique, vous devez configurer l'URL de l'API avec votre IP locale.

1. **Trouvez votre IP locale** :
   ```bash
   ipconfig
   # Cherchez "Adresse IPv4" sous votre connexion Wi-Fi
   # Exemple : 192.168.1.100
   ```

2. **Modifiez `src/config/api.ts`** :
   ```typescript
   const API_URL = __DEV__ 
     ? 'http://192.168.1.XXX:5000/api' // Remplacez XXX par votre IP
     : 'https://your-production-api.com/api';
   ```

3. **Vérifiez que le backend est démarré** :
   ```bash
   cd ../backend
   npm run dev
   ```

4. **Testez l'accès depuis votre téléphone** :
   - Ouvrez un navigateur sur votre téléphone
   - Allez à : `http://VOTRE_IP:5000/api`
   - Vous devriez voir une réponse JSON ou une erreur d'authentification (c'est normal)

### 3. Scannez le QR Code

L'app devrait maintenant se charger même si l'API n'est pas accessible, et vous verrez l'écran de login.

## 🔍 Diagnostic

### Si l'app se charge mais reste sur le spinner

1. **Vérifiez les logs dans le terminal** :
   - Regardez s'il y a des erreurs de connexion
   - Vérifiez que le serveur Metro est démarré

2. **Vérifiez les logs dans Expo Go** :
   - Secouez le téléphone
   - Appuyez sur "Debug Remote JS"
   - Regardez les erreurs dans la console

### Si l'app se charge mais ne peut pas se connecter à l'API

1. **Vérifiez la configuration réseau** :
   - Téléphone et ordinateur sur le même Wi-Fi
   - Pare-feu Windows autorise les connexions entrantes
   - Backend démarré et accessible

2. **Testez l'API manuellement** :
   ```bash
   # Depuis votre téléphone, ouvrez un navigateur
   http://VOTRE_IP:5000/api/auth/health
   # (si cet endpoint existe)
   ```

## ⚠️ Solutions Alternatives

### Option A : Désactiver Temporairement l'Auth Check

Si vous voulez tester l'app sans backend, modifiez temporairement `AuthContext.tsx` :

```typescript
const checkAuth = async () => {
  // Désactiver temporairement pour tester
  setLoading(false);
  return;
  
  // ... reste du code
};
```

### Option B : Utiliser le Mode Tunnel

Si vous avez des problèmes de réseau local :

```bash
npx expo start --tunnel --clear
```

## 📋 Checklist

- [ ] Expo redémarré avec `--clear`
- [ ] URL API configurée avec votre IP locale dans `src/config/api.ts`
- [ ] Backend démarré sur le port 5000
- [ ] Téléphone et ordinateur sur le même Wi-Fi
- [ ] Pare-feu Windows configuré
- [ ] Testé l'accès à l'API depuis le téléphone

## 🆘 Si Rien ne Fonctionne

1. **Testez avec App.test.tsx** :
   ```bash
   cp App.test.tsx App.tsx
   npx expo start --clear
   ```
   
   Si ça fonctionne, le problème vient du contexte Auth ou de la navigation.

2. **Partagez** :
   - Les logs du terminal
   - Les logs de "Debug Remote JS" dans Expo Go
   - Votre configuration réseau (IP utilisée)
