FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste du code
COPY . .

# Construire l'application Next.js
RUN npm run build

# Exposer le port (par défaut 3000 pour Next.js)
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
