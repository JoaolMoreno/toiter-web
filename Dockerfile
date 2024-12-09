# Usando uma imagem oficial do Node.js
FROM node:18

# Definindo o diretório de trabalho na imagem
WORKDIR /app

# Copiando arquivos de configuração e pacotes
COPY package*.json ./

# Instalando dependências
RUN npm install

# Copiando todo o projeto
COPY . .

# Build do projeto Next.js
RUN npm run build

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
