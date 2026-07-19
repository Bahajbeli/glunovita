# Guide de Dépannage - Erreurs Expo Go

## Erreurs Courantes et Solutions

### 1. Erreur "Unable to resolve module" ou "Cannot find module"

**Solution :**
```bash
cd frontend-mobile
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

### 2. Erreur "Assets not found" (icon.png, splash.png)

**Solution :** Les fichiers d'assets sont manquants. Créez-les ou utilisez des placeholders :

1. Créez des images simples (1024x1024 pour icon, 1284x2778 pour splash)
2. Ou utilisez un générateur en ligne : https://www.appicon.co/
3. Placez-les dans le dossier `assets/`

### 3. Erreur de connexion réseau / "Network request failed"

**Solution :**
- Vérifiez que le backend est démarré sur le port 5000
- Modifiez `src/config/api.ts` pour utiliser votre IP locale au lieu de `localhost`
- Exemple : `http://192.168.1.100:5000/api`
- Assurez-vous que votre téléphone et ordinateur sont sur le même réseau Wi-Fi

### 4. Erreur "Unable to connect to Metro bundler"

**Solution :**
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez avec :
npx expo start --clear
# Ou :
npm start -- --reset-cache
```

### 5. Erreur TypeScript / Compilation

**Solution :**
```bash
# Vérifiez les erreurs TypeScript
npx tsc --noEmit

# Si nécessaire, ignorez temporairement les erreurs TypeScript
# En modifiant tsconfig.json pour être moins strict
```

### 6. Erreur "Cannot read property 'navigate' of undefined"

**Solution :** Assurez-vous que tous les écrans sont correctement importés et que la navigation est configurée.

### 7. Erreur sur Android "Unable to load script"

**Solution :**
```bash
# Nettoyez le cache Metro
npx expo start --clear

# Sur Android, essayez aussi :
adb reverse tcp:8081 tcp:8081
```

### 8. Erreur "Expo Go version incompatible"

**Solution :**
- Mettez à jour Expo Go sur votre téléphone depuis l'App Store / Play Store
- Ou utilisez une version compatible d'Expo dans package.json

## Vérifications de Base

1. **Backend démarré ?**
   ```bash
   cd backend
   npm run dev
   ```

2. **Port 5000 accessible ?**
   - Testez : `http://localhost:5000/api/auth/health` (si endpoint existe)

3. **Même réseau Wi-Fi ?**
   - Téléphone et ordinateur doivent être sur le même réseau

4. **Expo CLI à jour ?**
   ```bash
   npm install -g expo-cli@latest
   ```

5. **Cache nettoyé ?**
   ```bash
   npx expo start --clear
   npm cache clean --force
   ```

## Logs et Debug

Pour voir les logs détaillés :
```bash
npx expo start --dev-client
```

Ou consultez les logs dans Expo Go :
- Secouez votre téléphone
- Appuyez sur "Debug Remote JS"

## Support

Si le problème persiste :
1. Vérifiez les logs dans le terminal où `npm start` est lancé
2. Vérifiez les logs dans Expo Go (secouez le téléphone)
3. Partagez le message d'erreur exact pour un diagnostic précis
