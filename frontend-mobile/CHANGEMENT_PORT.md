# Changement du Port Metro Bundler

## ✅ Configuration Modifiée

Le port Metro Bundler a été changé de **8081** à **8082**.

## 📝 Modifications Effectuées

1. **package.json** : Tous les scripts utilisent maintenant `--port 8082`
2. **.env** : Variable d'environnement `RCT_METRO_PORT=8082` ajoutée

## 🚀 Utilisation

Démarrez l'application normalement :

```bash
npm start
# ou
npm run android
# ou
npm run ios
```

Le serveur Metro démarrera automatiquement sur le port **8082**.

## 🔧 Changer le Port à Nouveau

Si vous voulez utiliser un autre port (par exemple 8083) :

1. **Modifiez package.json** :
```json
"start": "expo start --port 8083"
```

2. **Modifiez .env** :
```
RCT_METRO_PORT=8083
```

## ⚠️ Notes Importantes

- Assurez-vous que le nouveau port n'est pas déjà utilisé par une autre application
- Si vous utilisez un port différent, Expo Go devra se reconnecter automatiquement
- Sur Android, vous pourriez avoir besoin de configurer le port forwarding :
  ```bash
  adb reverse tcp:8082 tcp:8082
  ```

## 🐛 Dépannage

Si le port est déjà utilisé :

1. **Trouvez le processus qui utilise le port** :
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :8082
   
   # Ou pour un autre port
   netstat -ano | findstr :8081
   ```

2. **Arrêtez le processus** ou utilisez un autre port

3. **Redémarrez Expo** :
   ```bash
   npx expo start --clear --port 8082
   ```
