# Toiter - Rede Social

Toiter é uma rede social moderna construída com Vue 3, TypeScript e Vite.

## Migração Concluída

Este projeto foi migrado com sucesso de **React com Next.js** para **Vue 3 com Vite**.

## Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Build tool e dev server rápido
- **Pinia** - Gerenciamento de estado para Vue
- **Vue Router** - Roteamento oficial do Vue
- **Axios** - Cliente HTTP com suporte a cookies
- **Vue Toastification** - Notificações toast
- **SockJS + STOMP** - WebSocket para chat em tempo real
- **HttpOnly Cookies** - Autenticação segura sem exposição de tokens ao JavaScript

## Estrutura do Projeto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes Vue reutilizáveis
├── composables/     # Composables do Vue (lógica compartilhada)
├── models/          # Definições de tipos TypeScript
├── router/          # Configuração do Vue Router
├── services/        # Serviços da API
├── stores/          # Stores do Pinia
└── views/           # Componentes de página
```

## Comandos Disponíveis

### Desenvolvimento
```bash
npm install      # Instalar dependências
npm run dev      # Iniciar servidor de desenvolvimento
```

### Produção
```bash
npm run build    # Build de produção
npm run preview  # Preview do build de produção
```

### Docker
```bash
docker build -t toiter-web .
docker run -p 80:80 toiter-web
```

## Funcionalidades

- ✅ Autenticação de usuários (login/registro)
- ✅ Feed de posts com scroll infinito
- ✅ Criação de posts
- ✅ Curtir e descurtir posts
- ✅ Comentar em posts (threads)
- ✅ Perfil de usuário
- ✅ Seguir/desseguir usuários
- ✅ Roteamento com guardas de autenticação
- ✅ Chat em tempo real com WebSocket
- 🔒 Autenticação segura via HttpOnly cookies

## Segurança

Este projeto implementa práticas de segurança modernas para proteção contra ataques XSS:

### Autenticação via HttpOnly Cookies

- **Tokens JWT não são expostos ao JavaScript**: O `accessToken` e `refresh_token` são armazenados em cookies HttpOnly, inacessíveis via JavaScript
- **Sem uso de localStorage para tokens**: Tokens de autenticação nunca são armazenados em localStorage ou sessionStorage
- **WebSocket autenticado via cookies**: A conexão WebSocket para chat utiliza cookies enviados automaticamente no handshake, sem necessidade de headers `Authorization` manuais
- **Proteção contra XSS**: Mesmo que um atacante injete código JavaScript malicioso, não é possível acessar os tokens de autenticação

### Configuração do Cliente HTTP

```typescript
// Todas as requisições enviam cookies automaticamente
const api = axios.create({
  baseURL: '/api',
  withCredentials: true  // Envia cookies HttpOnly
});
```

### Fluxo de Autenticação

1. **Login**: O backend define cookies HttpOnly (`accessToken`, `refresh_token`)
2. **Requisições**: Cookies são enviados automaticamente pelo navegador
3. **WebSocket**: Autenticação via cookies na handshake HTTP
4. **Refresh**: Em caso de token expirado (401), o frontend solicita refresh e o backend atualiza os cookies automaticamente

**Importante**: Este frontend requer um backend que suporte autenticação via HttpOnly cookies.

## Configuração

O projeto utiliza Vite com hot module replacement (HMR) para desenvolvimento rápido.

Para configurações adicionais, consulte:
- [Vite Configuration Reference](https://vite.dev/config/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## Licença

Este projeto foi desenvolvido como parte de um trabalho acadêmico.
