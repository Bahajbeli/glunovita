# 🚨 Solution Immédiate - Erreur "Failed to download remote update"

## ✅ Correction Appliquée

J'ai remis le port par défaut **8081** car Expo Go est configuré pour ce port par défaut.

## 🚀 Actions Immédiates

### 1. Arrêtez le serveur actuel
Appuyez sur `Ctrl+C` dans le terminal où Expo tourne.

### 2. Redémarrez avec le port par défaut
```bash
cd frontend-mobile
npx expo start --clear
```

### 3. Scannez le QR code dans Expo Go
L'application devrait maintenant pouvoir télécharger le bundle.

## 🔍 Si ça ne Fonctionne Toujours Pas

### Option A : Vérifier la Connexion Réseau

1. **Trouvez votre IP locale** :
   ```bash
   ipconfig
   # Cherchez "Adresse IPv4" sous votre connexion Wi-Fi
   ```

2. **Testez depuis votre téléphone** :
   - Ouvrez un navigateur sur votre téléphone
   - Allez à : `http://VOTRE_IP:8081`
   - Vous devriez voir une page Expo

3. **Si ça ne fonctionne pas** :
   - Vérifiez le pare-feu Windows
   - Assurez-vous d'être sur le même réseau Wi-Fi

### Option B : Utiliser le Mode Tunnel

Si vous avez des problèmes de réseau local :

```bash
npx expo start --tunnel --clear
```

Le mode tunnel fonctionne même si vous n'êtes pas sur le même réseau, mais peut être plus lent.

### Option C : Vérifier les Logs

Dans le terminal où `npm start` est lancé :
- Regardez s'il y a des erreurs
- Vérifiez que le serveur démarre sur le port 8081
- Regardez les requêtes quand vous scannez le QR code

## 📱 Configuration Android (si nécessaire)

Si vous utilisez Android et que ça ne fonctionne toujours pas :

```bash
adb reverse tcp:8081 tcp:8081
```

## ⚠️ Note Importante

Le port 8081 est le port par défaut d'Expo Go. Si vous avez besoin d'un port différent, vous devrez :
1. Configurer le port forwarding Android
2. Ou utiliser le mode tunnel
3. Ou modifier la configuration Expo Go (plus complexe)

Pour l'instant, utilisez le port 8081 par défaut pour éviter les problèmes.
