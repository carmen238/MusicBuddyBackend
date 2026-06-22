FROM node:18-alpine

WORKDIR /usr/src/app

# Copia solo i file di gestione pacchetti per sfruttare la cache di Docker
COPY package*.json ./

# Installa le dipendenze (escludendo quelle di sviluppo se non necessarie)
RUN npm install --only=production

# Copia tutta la struttura del progetto (config, database, models, routes, ecc.)
COPY . .

# Esponiamo la porta standard (modificala se nel .env usi un'altra porta)
EXPOSE 3000

# Avvia il server (usa "index.js" se è quello il file che esegue app.listen)
CMD ["node", "server.js"]