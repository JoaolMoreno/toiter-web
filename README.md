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
- **Axios** - Cliente HTTP
- **Vue Toastification** - Notificações toast

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
- 🔄 Chat (em desenvolvimento)

## Configuração

O projeto utiliza Vite com hot module replacement (HMR) para desenvolvimento rápido.

Para configurações adicionais, consulte:
- [Vite Configuration Reference](https://vite.dev/config/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## Licença

Este projeto foi desenvolvido como parte de um trabalho acadêmico.
