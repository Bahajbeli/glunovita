# Guide de Démarrage Rapide

## ✅ Installation Complétée

Les dépendances ont été installées avec succès. Vous pouvez maintenant démarrer l'application.

## 🚀 Démarrer l'Application

1. **Assurez-vous que le backend est démarré** :
```bash
cd ../backend
npm run dev
```

2. **Configurez l'URL de l'API** (si nécessaire) :
   - Ouvrez `src/config/api.ts`
   - Pour tester sur un appareil physique ou émulateur Android, remplacez `localhost` par votre IP locale
   - Exemple : `http://192.168.1.100:5000/api`
   - Pour trouver votre IP : `ipconfig` dans PowerShell

3. **Démarrez l'application mobile** :
```bash
cd frontend-mobile
npm start
```

4. **Scannez le QR code** :
   - **iOS** : Utilisez l'appareil photo et ouvrez avec Expo Go
   - **Android** : Utilisez l'app Expo Go pour scanner le QR code

## 📱 Tester sur Émulateur

### Android
```bash
npm run android
```

### iOS (Mac uniquement)
```bash
npm run ios
```

## ⚠️ Notes Importantes

- Les erreurs `TAR_ENTRY_ERROR` lors de l'installation sont normales sur Windows et n'affectent pas le fonctionnement avec Expo
- Assurez-vous que votre téléphone et votre ordinateur sont sur le même réseau Wi-Fi
- Le backend doit être accessible depuis votre appareil mobile

## 🐛 Dépannage

Si vous rencontrez des problèmes :

1. **Nettoyer le cache** :
```bash
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

2. **Vérifier la connexion réseau** :
   - Assurez-vous que le backend est accessible sur le port 5000
   - Vérifiez votre pare-feu Windows

3. **Réinstaller Expo CLI globalement** (optionnel) :
```bash
npm install -g expo-cli
```
