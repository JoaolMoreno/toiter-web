# **Toiter - Clone do Twitter**

Este é o repositório do **Toiter**, um clone do Twitter focado em interação em tempo real, alta escalabilidade e um tema visual moderno com predominância de verde. O projeto utiliza **Next.js** no front-end, com React e TypeScript, enquanto o back-end é baseado em microsserviços. A aplicação permite criar, curtir, repostar, responder e visualizar postagens, além de oferecer feeds personalizados e recursos sociais.

---

## **Índice**
1. [Sobre o Projeto](#sobre-o-projeto)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Estrutura de Telas](#estrutura-de-telas)
6. [Como Contribuir](#como-contribuir)
7. [Licença](#licença)

---

## **Sobre o Projeto**

O **Toiter** é uma rede social minimalista inspirada no Twitter. Ele é projetado para ser modular, escalável e interativo, permitindo aos usuários publicar postagens curtas e interagir em tempo real com o conteúdo de outros usuários.

### **Objetivos do Projeto**
- Oferecer uma experiência de usuário fluida e moderna.
- Implementar funcionalidades comuns de redes sociais, como curtidas, repostagens e respostas.
- Criar um ambiente extensível para futuras funcionalidades, como notificações e mensagens diretas.

---

## **Funcionalidades**
- **Cadastro e Autenticação**:
    - Cadastro de novos usuários.
    - Login utilizando JWT para autenticação segura.

- **Feed de Postagens**:
    - Feed personalizado com postagens de usuários seguidos.
    - Postagens destacadas por interações recentes.

- **Postagens**:
    - Criar postagens com ou sem mídia.
    - Curtir, repostar e responder a postagens.
    - Visualizar respostas em formato de thread.

- **Perfil de Usuário**:
    - Exibir informações do perfil (nome, bio, imagem).
    - Listar postagens e interações do usuário.
    - Permitir edição de informações pessoais.

- **Relacionamentos**:
    - Seguir e deixar de seguir usuários.
    - Listar seguidores e seguidos.

---

## **Tecnologias Utilizadas**

### **Front-End**
- **Framework**: [Next.js](https://nextjs.org/) (React + SSR/SSG).
- **Linguagem**: TypeScript.
- **Estilização**: Styled Components.

### **Back-End**
- **Linguagem**: Java.
- **Framework**: Spring Boot.
- **Banco de Dados**: PostgreSQL e Redis (cache).

### **Outras Ferramentas**
- Docker e Docker Compose para orquestração.
- Mensageria com Apache Kafka.
- Controle de versão com Git.

---

## **Configuração do Ambiente**

### **Pré-requisitos**
- Node.js (LTS recomendado).
- NPM ou Yarn.
- Docker e Docker Compose.

### **Instalação**
1. Clone este repositório:
   ```bash
   git clone https://github.com/JoaolMoreno/toiter-frontend.git
   cd toiter-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação em `http://localhost:3000`.

---

## **Estrutura de Telas**

### **Tela de Login**
- **Descrição**: Formulário para login do usuário com validação de credenciais.
- **Elementos**:
    - Campo de email/username.
    - Campo de senha.
    - Botão de login.
    - Link para cadastro.

### **Tela de Registro**
- **Descrição**: Formulário para criação de conta.
- **Elementos**:
    - Campos de nome, email, senha e confirmação de senha.
    - Botão de registro.

### **Tela de Feed**
- **Descrição**: Exibe postagens de usuários seguidos.
- **Elementos**:
    - Header com botão de logout.
    - Campo para criar uma nova postagem.
    - Lista de postagens com interações (curtir, repostar, responder).
    - Carregamento infinito para novas postagens.

### **Tela de Postagem**
- **Descrição**: Exibe os detalhes de uma postagem.
- **Elementos**:
    - Conteúdo completo da postagem.
    - Contador de curtidas, repostagens e respostas.
    - Lista de respostas em formato de thread.

### **Tela de Perfil**
- **Descrição**: Exibe informações e postagens de um usuário.
- **Elementos**:
    - Foto de perfil e cabeçalho.
    - Nome, bio e contadores (seguidores e seguindo).
    - Lista de postagens do usuário.
    - Botão de editar perfil (para o próprio usuário).

### **Tela de Seguidores e Seguindo**
- **Descrição**: Lista de usuários que seguem ou são seguidos.
- **Elementos**:
    - Nome e foto de perfil de cada usuário.
    - Botão para seguir/deixar de seguir.

### **Tela de Notificações** (Planejada)
- **Descrição**: Exibe notificações sobre interações no perfil do usuário.
- **Elementos**:
    - Lista de notificações (curtidas, respostas, repostagens, novos seguidores).

### **Tela de Configurações** (Planejada)
- **Descrição**: Gerenciamento de configurações da conta.
- **Elementos**:
    - Alteração de senha.
    - Exclusão de conta.

---

## **Como Contribuir**
1. Faça um fork do projeto.
2. Crie uma branch para sua funcionalidade:
   ```bash
   git checkout -b minha-funcionalidade
   ```
3. Faça as alterações e comite:
   ```bash
   git commit -m "Adicionei minha funcionalidade"
   ```
4. Envie as alterações:
   ```bash
   git push origin minha-funcionalidade
   ```
5. Crie um Pull Request.

---

## **Licença**
Este projeto está licenciado sob a [MIT License](LICENSE).