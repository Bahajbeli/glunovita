FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste du code
COPY . .

# Exposer le port de l'API (généralement 5000, 8000 ou 3001)
EXPOSE 5000

# Démarrer le serveur
# Assurez-vous que votre package.json contient bien un script "start": "node server.js"
CMD ["npm", "start"]
