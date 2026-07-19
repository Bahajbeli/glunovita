# Glunovita Mobile App

Application mobile React Native pour la plateforme Glunovita de gestion de la maladie cœliaque.

## Technologies

- **React Native** avec **Expo**
- **TypeScript**
- **React Navigation** pour la navigation
- **Axios** pour les appels API
- **AsyncStorage** pour le stockage local
- **React Native Maps** pour les cartes géographiques
- **Expo Location** pour la géolocalisation

## Structure du Projet

```
frontend-mobile/
├── src/
│   ├── config/
│   │   └── api.ts              # Configuration API
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexte d'authentification
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation principale
│   └── screens/
│       ├── auth/              # Écrans d'authentification
│       ├── patient/           # Écrans patient
│       ├── doctor/            # Écrans docteur
│       ├── admin/             # Écrans admin
│       └── secretary/         # Écrans secrétaire
├── App.tsx                    # Point d'entrée
├── package.json
└── app.json                   # Configuration Expo
```

## Installation

1. Installer les dépendances :
```bash
cd frontend-mobile
npm install
```

2. Configurer l'URL de l'API dans `src/config/api.ts` :
```typescript
const API_URL = 'http://votre-ip:5000/api'; // Pour Android, utilisez votre IP locale
```

3. Démarrer l'application :
```bash
npm start
```

Pour Android :
```bash
npm run android
```

Pour iOS :
```bash
npm run ios
```

## Configuration

### Android
Pour tester sur un appareil Android physique ou émulateur, vous devez utiliser l'IP locale de votre machine au lieu de `localhost`.

Dans `src/config/api.ts`, remplacez :
```typescript
const API_URL = 'http://localhost:5000/api';
```

Par :
```typescript
const API_URL = 'http://192.168.x.x:5000/api'; // Votre IP locale
```

### iOS
Pour iOS, `localhost` fonctionne sur le simulateur, mais pour un appareil physique, utilisez également votre IP locale.

## Fonctionnalités

### Patients
- Consultation des produits
- Ajout au panier et commande
- Réservation de consultations
- Visualisation des commandes

### Docteurs
- Gestion des consultations journalières
- Complétion du profil
- Gestion de la localisation sur carte

### Admins
- Gestion des produits
- Gestion des commandes

### Secrétaires
- Gestion des consultations du docteur assigné

## Backend

L'application utilise le backend existant dans le dossier `backend/`. Assurez-vous que le serveur backend est démarré et accessible depuis votre appareil mobile ou émulateur.
