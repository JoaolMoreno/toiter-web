# Build stage
FROM node:20 AS build

# Definindo o diretório de trabalho na imagem
WORKDIR /app

# Copiando arquivos de configuração e pacotes
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copiando todo o projeto
COPY . .

# Build do projeto Vite com SSR
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./

# Copy necessary files
COPY index.html ./

# Expõe a porta da aplicação
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Comando para iniciar o servidor SSR
CMD ["node", "server.js"]
