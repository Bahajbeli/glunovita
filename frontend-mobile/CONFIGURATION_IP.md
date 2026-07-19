# 📱 Configuration de l'IP pour l'API

## ⚠️ Important

Vous avez fourni l'IP de votre **téléphone** (192.236.232.55), mais il faut utiliser l'IP de votre **ordinateur** (où tourne le backend).

## 🔍 Trouver l'IP de Votre Ordinateur

### Méthode 1 : PowerShell

```bash
ipconfig
```

Cherchez "Adresse IPv4" sous votre connexion Wi-Fi. Elle devrait ressembler à :
- `192.168.1.XXX`
- `192.168.0.XXX`
- `10.0.0.XXX`

### Méthode 2 : Interface Réseau Windows

1. Ouvrez "Paramètres" → "Réseau et Internet"
2. Cliquez sur votre connexion Wi-Fi
3. Cherchez "Adresse IPv4"

## ✅ Configuration

Une fois que vous avez l'IP de votre ordinateur (par exemple `192.168.1.100`), modifiez `src/config/api.ts` :

```typescript
const API_URL = __DEV__ 
  ? 'http://192.168.1.100:5000/api' // Remplacez par votre IP
  : 'https://your-production-api.com/api';
```

## 🔄 Pourquoi ?

- **Téléphone** : 192.236.232.55 (IP publique ou différente)
- **Ordinateur** : 192.168.1.XXX (IP locale sur votre réseau Wi-Fi)

Le téléphone doit se connecter à l'ordinateur via l'IP locale de l'ordinateur, pas sa propre IP.

## 📋 Checklist

- [ ] Trouvé l'IP de l'ordinateur (pas du téléphone)
- [ ] Modifié `src/config/api.ts` avec l'IP de l'ordinateur
- [ ] Backend démarré sur le port 5000
- [ ] Téléphone et ordinateur sur le même réseau Wi-Fi
- [ ] Testé l'accès depuis le téléphone : `http://IP_ORDINATEUR:5000/api`
