# Guia de Tipografia (Toiter)

Este documento define as regras e estilos de tipografia para o projeto "Toiter", garantindo consistência visual, legibilidade e uma hierarquia clara em todos os componentes e páginas.

## 1. Família de Fontes

Para manter uma aparência moderna, limpa e legível, usaremos a stack de fontes padrão do sistema (System UI).

* **CSS:** `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`

## 2. Hierarquia e Escala

Usamos uma escala de tipografia para definir títulos, parágrafos e textos secundários.

| Uso | Tamanho (rem/px) | Peso (Weight) | Cor |
| :--- | :--- | :--- | :--- |
| **Título de Página** | `1.75rem` (28px) | `700` (Bold) | Primária |
| **Título de Seção** | `1.25rem` (20px) | `700` (Bold) | Primária |
| **Texto (Body)** | `1rem` (16px) | `400` (Regular) | Primária |
| **Texto Secundário** | `0.875rem` (14px) | `400` (Regular) | Secundária |
| **Botão** | `1rem` (16px) | `600` (SemiBold) | (Varia) |

## 3. Cores de Texto (Modo Escuro)

* **Primária:** Usada para o conteúdo principal, nomes e títulos.
    * `#EFEFEF` (Branco suave)
* **Secundária:** Usada para metadados, timestamps, @handles e texto de menor ênfase.
    * `#888888` (Cinza médio)
* **Acento (Link):** Usada para links, menções e CTAs.
    * `#1DA1F2` (Azul Twitter) ou o seu verde: `#34D399`

---

## 4. Estilização de Componentes

### 4.1. Componente: Post (Feed e Thread)

* **Nome de Usuário (Display Name):**
    * Tamanho: `1rem` (16px)
    * Peso: `700` (Bold)
    * Cor: `Primária`
* **Timestamp (Data/Hora):**
    * Tamanho: `0.875rem` (14px)
    * Peso: `400` (Regular)
    * Cor: `Secundária`
* **Texto do Post (Conteúdo):**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `Primária`

### 4.2. Página: Perfil

* **Nome de Usuário (Display Name):**
    * Tamanho: `1.5rem` (24px)
    * Peso: `800` (ExtraBold)
    * Cor: `Primária`
* **Handle (@username):**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `Secundária`
* **Bio:**
    * Tamanho: `1rem` (16px)
    * Peso: `400` (Regular)
    * Cor: `Primária`
* **Estatísticas (Posts, Seguidores, Seguindo):**
    * **Número:**
        * Tamanho: `1rem` (16px)
        * Peso: `700` (Bold)
        * Cor: `Primária`
    * **Rótulo ("Posts", "Seguidores"):**
        * Tamanho: `1rem` (16px)
        * Peso: `400` (Regular)
        * Cor: `Secundária`
        * *Nota: Deve ter um leve espaçamento do número.*

### 4.3. Títulos de Página

* **Exemplos:** "Seu Feed", "Visualização de Thread", "Respostas"
* **Estilo:** Usar **Título de Página**
    * Tamanho: `1.75rem` (28px)
    * Peso: `700` (Bold)
    * Cor: `Primária`
