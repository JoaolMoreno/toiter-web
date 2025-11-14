# Guia de Tipografia e Temas (Toiter)

Este documento define as regras e estilos de tipografia para o projeto "Toiter", garantindo consistência visual, legibilidade e uma hierarquia clara em todos os componentes e páginas.

## 1. Sistema de Temas

O Toiter implementa um sistema robusto de temas com suporte para modo **Escuro (Dark)** e modo **Claro (Light)**.

### 1.1. Funcionalidades do Sistema de Temas

* **Alternância de Temas:** Botão de alternância localizado no cabeçalho, ao lado do perfil do usuário
* **Persistência:** Preferência do tema salva no `localStorage` do navegador
* **Padrão do Sistema:** Se nenhuma preferência está salva, o tema padrão segue a preferência do sistema operacional do usuário
* **Transições Suaves:** Todas as cores mudam suavemente entre os temas

### 1.2. Variáveis CSS de Cores

Todas as cores são definidas como variáveis CSS e mudam automaticamente de acordo com o tema:

#### Tema Escuro (Dark)
* **Cores Principais:**
  * `--color-primary`: #4CAF50 (Verde principal)
  * `--color-secondary`: #1B5E20 (Verde escuro)
  * `--color-accent`: #34D399 (Verde claro/acento)
* **Backgrounds:**
  * `--color-background`: #121212 (Fundo principal)
  * `--color-background-alt`: #1E1E1E (Fundo alternativo)
  * `--color-background-elevated`: #242424 (Elementos elevados)
* **Texto:**
  * `--color-text`: #EFEFEF (Texto principal - branco suave)
  * `--color-text-secondary`: #888888 (Texto secundário - cinza médio)
  * `--color-text-light`: #9E9E9E (Texto claro)
* **Outros:**
  * `--color-border`: #333333
  * `--color-button-hover`: #388E3C
  * `--color-error`: #CF6679

#### Tema Claro (Light)
* **Cores Principais:**
  * `--color-primary`: #4CAF50 (Verde principal - mantido)
  * `--color-secondary`: #2E7D32 (Verde médio)
  * `--color-accent`: #66BB6A (Verde claro/acento)
* **Backgrounds:**
  * `--color-background`: #FFFFFF (Branco)
  * `--color-background-alt`: #F5F5F5 (Cinza muito claro)
  * `--color-background-elevated`: #FAFAFA (Quase branco)
* **Texto:**
  * `--color-text`: #1A1A1A (Texto principal - preto suave)
  * `--color-text-secondary`: #666666 (Texto secundário - cinza médio)
  * `--color-text-light`: #757575 (Texto claro)
* **Outros:**
  * `--color-border`: #E0E0E0
  * `--color-button-hover`: #66BB6A
  * `--color-error`: #D32F2F

### 1.3. Como Usar as Variáveis

Sempre use variáveis CSS ao invés de cores hardcoded:

```css
/* ✅ Correto */
.elemento {
  background-color: var(--color-background);
  color: var(--color-text);
}

/* ❌ Incorreto */
.elemento {
  background-color: #121212;
  color: #EFEFEF;
}
```

## 2. Família de Fontes

Para manter uma aparência moderna, limpa e legível, usamos a stack de fontes padrão do sistema (System UI).

* **CSS:** `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`

## 3. Hierarquia e Escala

Usamos uma escala de tipografia para definir títulos, parágrafos e textos secundários.

| Uso | Tamanho (rem/px) | Peso (Weight) | Cor |
| :--- | :--- | :--- | :--- |
| **Título de Página** | `1.75rem` (28px) | `700` (Bold) | `var(--color-text)` |
| **Título de Seção** | `1.25rem` (20px) | `700` (Bold) | `var(--color-text)` |
| **Texto (Body)** | `1rem` (16px) | `400` (Regular) | `var(--color-text)` |
| **Texto Secundário** | `0.875rem` (14px) | `400` (Regular) | `var(--color-text-secondary)` |
| **Botão** | `1rem` (16px) | `600` (SemiBold) | (Varia) |

## 4. Cores de Texto

Use sempre as variáveis CSS para garantir compatibilidade com ambos os temas:

* **Primária:** Usada para o conteúdo principal, nomes e títulos.
    * Variável: `var(--color-text)`
* **Secundária:** Usada para metadados, timestamps, @handles e texto de menor ênfase.
    * Variável: `var(--color-text-secondary)`
* **Acento (Link):** Usada para links, menções e CTAs.
    * Variável: `var(--color-accent)` ou `var(--color-primary)`

---

## 5. Estilização de Componentes

### 5.1. Componente: Post (Feed e Thread)

* **Nome de Usuário (Display Name):**
    * Tamanho: `1rem` (16px)
    * Peso: `700` (Bold)
    * Cor: `var(--color-text)`
* **Timestamp (Data/Hora):**
    * Tamanho: `0.875rem` (14px)
    * Peso: `400` (Regular)
    * Cor: `var(--color-text-secondary)`
* **Texto do Post (Conteúdo):**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `var(--color-text)`

### 5.2. Página: Perfil

* **Nome de Usuário (Display Name):**
    * Tamanho: `1.5rem` (24px)
    * Peso: `800` (ExtraBold)
    * Cor: `var(--color-text)`
* **Handle (@username):**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `var(--color-text-secondary)`
* **Bio:**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `var(--color-text)`
* **Estatísticas (Posts, Seguidores, Seguindo):**
    * **Número:**
        * Tamanho: `1rem` (16px)
        * Peso: `700` (Bold)
        * Cor: `var(--color-text)`
    * **Rótulo ("Posts", "Seguidores"):**
        * Tamanho: `1rem` (16px)
        * Peso: `400` (Regular)
        * Cor: `var(--color-text-secondary)`
        * *Nota: Deve ter um leve espaçamento do número.*

### 5.3. Títulos de Página

* **Exemplos:** "Seu Feed", "Visualização de Thread", "Respostas"
* **Estilo:** Usar **Título de Página**
    * Tamanho: `1.75rem` (28px)
    * Peso: `700` (Bold)
    * Cor: `var(--color-text)`

### 5.4. Botão de Alternância de Tema

* Localização: Cabeçalho, entre o nome do app e o botão de logout/login
* Ícones: ☀️ (sol) para tema escuro / 🌙 (lua) para tema claro
* Estilo: Botão com borda, sem background, transição suave ao hover
