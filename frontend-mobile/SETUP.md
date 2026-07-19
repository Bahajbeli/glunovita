# Guide d'Installation - Glunovita Mobile

## Prérequis

1. **Node.js** (version 18 ou supérieure)
2. **npm** ou **yarn**
3. **Expo CLI** : `npm install -g expo-cli`
4. **Expo Go** app sur votre téléphone (iOS ou Android)

## Installation

1. **Installer les dépendances** :
```bash
cd frontend-mobile
npm install
```

2. **Configurer l'URL de l'API** :
   
   Pour tester sur un appareil physique ou émulateur Android/iOS, vous devez utiliser l'IP locale de votre machine au lieu de `localhost`.
   
   Modifiez `src/config/api.ts` :
   ```typescript
   const API_URL = 'http://192.168.x.x:5000/api'; // Remplacez par votre IP locale
   ```
   
   Pour trouver votre IP locale :
   - **Windows** : `ipconfig` dans PowerShell
   - **Mac/Linux** : `ifconfig` ou `ip addr`

3. **Démarrer le backend** :
```bash
cd ../backend
npm run dev
```

4. **Démarrer l'application mobile** :
```bash
cd frontend-mobile
npm start
```

5. **Scanner le QR code** avec Expo Go (iOS) ou l'appareil photo (Android)

## Structure des Écrans

### Authentification
- **LoginScreen** : Connexion
- **RegisterScreen** : Inscription

### Patient
- **DashboardScreen** : Tableau de bord
- **ProductsScreen** : Liste des produits
- **CartScreen** : Panier
- **BookConsultationScreen** : Réservation de consultation
- **OrdersScreen** : Historique des commandes

### Docteur
- **DashboardScreen** : Tableau de bord
- **AppointmentsScreen** : Consultations du jour
- **ProfileScreen** : Profil et informations
- **LocationScreen** : Gestion de la localisation

### Admin
- **DashboardScreen** : Tableau de bord
- **ProductsScreen** : Gestion des produits
- **OrdersScreen** : Gestion des commandes

### Secrétaire
- **DashboardScreen** : Gestion des consultations

## Notes Importantes

- Pour Android, assurez-vous que votre téléphone et votre ordinateur sont sur le même réseau Wi-Fi
- L'URL de l'API doit être accessible depuis votre appareil mobile
- Le backend doit être démarré et accessible sur le port 5000
