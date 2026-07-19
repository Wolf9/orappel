# Build
FROM node:20-alpine AS builder

# Nécessaire pour Next.js (SWC) sous Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app
ARG DIR=orappel

# Copier les fichiers de dépendances
COPY ${DIR}/package*.json ./
RUN npm install

# Copier le reste du projet
COPY ${DIR}/ ./
RUN npm run build

# Prod
FROM node:20-alpine
WORKDIR /app

# Copier les fichiers générés en mode standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Créer le dossier pour les données locales (JSON) et donner les droits à l'utilisateur node
RUN mkdir -p /app/data && chown node:node /app/data

# Définir l'environnement
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Lancer le serveur Next.js en standalone
CMD ["node", "server.js"]
