# Build stage
FROM node:18 AS build

# Definindo o diretório de trabalho na imagem
WORKDIR /app

# Copiando arquivos de configuração e pacotes
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copiando todo o projeto
COPY . .

# Build do projeto Vite
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copiar o build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx se necessário
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta padrão do nginx
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
