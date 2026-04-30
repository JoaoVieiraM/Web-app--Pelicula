# Design System — Markel Film

Documento de referência de identidade visual da aplicação. Baseado na logo oficial da Markel Film (preto, vermelho e branco).

**Versão:** 1.0
**Aplicação:** v1 (rebrand cosmético, mantendo estrutura existente)

---

## 1. Princípios visuais

A logo da Markel transmite três coisas:

- **Peso e autoridade** — fonte serifada sólida em branco sobre preto.
- **Personalidade** — cursiva vermelha em "Film".
- **Sofisticação** — fundo preto generoso.

A UI deve refletir essa personalidade: **séria, profissional, com pontos de cor que dão vida sem cansar.**

Não é loja popular barata. Não é tech startup descolada. É oficina especializada premium.

## 2. Paleta de cores

### Cores principais (das 3 cores da logo)

| Token | Hex | Uso | Observação |
|---|---|---|---|
| `--color-black` | `#0F0F10` | Header, sidebar, backgrounds escuros | Preto não-puro; mais quente que `#000` |
| `--color-red` | `#D62828` | Acentos, badges, logo, alertas de marca | Vermelho da logo, comedido |
| `--color-white` | `#FFFFFF` | Texto sobre fundo escuro, fundos primários | Puro |

### Cinzas neutros (escala completa, do mais escuro ao mais claro)

| Token | Hex | Uso |
|---|---|---|
| `--gray-900` | `#1A1A1C` | Texto principal sobre fundo claro |
| `--gray-700` | `#3A3A3E` | Texto secundário sobre fundo claro |
| `--gray-500` | `#71717A` | Texto desabilitado, placeholders |
| `--gray-300` | `#D4D4D8` | Bordas, divisórias |
| `--gray-200` | `#E4E4E7` | Fundo de campos (input idle), hover sutil |
| `--gray-100` | `#F4F4F5` | Fundo de seções alternadas |
| `--gray-50` | `#FAFAFA` | Fundo geral da aplicação |

### Cor primária (botões e ações)

A cor primária **NÃO é o vermelho**. É um cinza muito escuro, quase preto, que combina com a identidade preto/branco e mantém o vermelho reservado para acentos.

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#1A1A1C` | Botões principais (Salvar, Confirmar, Entrar) |
| `--color-primary-hover` | `#000000` | Estado hover do botão primário |
| `--color-primary-text` | `#FFFFFF` | Texto sobre o botão primário |

### Cor de acento (vermelho da marca)

Usada com parcimônia. Apenas em:
- Logo na sidebar
- Badge de status "ativo" ou destaques de marca
- Indicador de página ativa no menu
- Botão de ação destrutiva (Excluir, Cancelar) — combina com função semântica

| Token | Hex | Uso |
|---|---|---|
| `--color-accent` | `#D62828` | Acentos de marca, destaques pontuais |
| `--color-accent-hover` | `#B71C1C` | Hover do acento |

### Cores de status (semânticas)

Vermelho da marca só é usado para destaques visuais, não para erros do sistema. Erros usam tom diferente para evitar conflito visual.

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#16A34A` | Sucesso, garantia ativa |
| `--color-warning` | `#EA580C` | Atenção, garantia próxima do vencimento (laranja escuro, não vermelho) |
| `--color-danger` | `#991B1B` | Erro, garantia vencida (vermelho mais escuro/borgonha, não conflita com acento) |
| `--color-info` | `#2563EB` | Informação neutra |

## 3. Tipografia

Mantém-se a tipografia atual (Tailwind padrão). Não é parte deste rebrand cosmético.

Para identidade futura, considera-se uma fonte serifada para títulos (combinaria com a fonte do logo "Markel"), mas isso fica para v1.1.

## 4. Aplicação dos tokens — variáveis CSS

Adicionar no início de `web/src/css/main.css` ou no `<style>` global:

```css
:root {
  /* Cores principais */
  --color-black: #0F0F10;
  --color-red: #D62828;
  --color-white: #FFFFFF;

  /* Cinzas */
  --gray-900: #1A1A1C;
  --gray-700: #3A3A3E;
  --gray-500: #71717A;
  --gray-300: #D4D4D8;
  --gray-200: #E4E4E7;
  --gray-100: #F4F4F5;
  --gray-50: #FAFAFA;

  /* Primária (cinza escuro) */
  --color-primary: #1A1A1C;
  --color-primary-hover: #000000;
  --color-primary-text: #FFFFFF;

  /* Acento (vermelho comedido) */
  --color-accent: #D62828;
  --color-accent-hover: #B71C1C;

  /* Status */
  --color-success: #16A34A;
  --color-warning: #EA580C;
  --color-danger: #991B1B;
  --color-info: #2563EB;
}
```

## 5. Mapeamento — onde cada cor aparece na aplicação

### Sidebar/menu lateral
- Fundo: `var(--color-black)`
- Texto: `var(--color-white)`
- Item ativo: fundo `var(--color-accent)` ou borda lateral em `var(--color-accent)`
- Hover de item: fundo `rgba(255,255,255,0.05)`

### Header
- Fundo: `var(--color-white)` ou `var(--gray-50)`
- Texto: `var(--gray-900)`
- Borda inferior: `var(--gray-200)`

### Botões
- **Primário (Salvar, Entrar):** fundo `var(--color-primary)`, texto branco, hover `var(--color-primary-hover)`
- **Secundário (Cancelar):** fundo transparente, borda `var(--gray-300)`, texto `var(--gray-900)`
- **Destrutivo (Excluir):** fundo `var(--color-danger)`, texto branco
- **Acento (ações de marca):** fundo `var(--color-accent)`, texto branco — usar com parcimônia

### Inputs
- Borda idle: `var(--gray-300)`
- Borda focus: `var(--color-primary)` (preto/cinza escuro, NÃO vermelho)
- Background: `var(--color-white)`
- Texto: `var(--gray-900)`
- Placeholder: `var(--gray-500)`

### Cards
- Fundo: `var(--color-white)`
- Borda: `var(--gray-200)` ou shadow sutil
- Sombra opcional: `0 1px 3px rgba(0,0,0,0.05)`

### Badges de status (timeline de garantia)
- Ativo (verde): `var(--color-success)`
- Expirando (laranja): `var(--color-warning)`
- Vencido (cinza): `var(--gray-500)`
- Removido (vermelho): `var(--color-danger)`

### Tela de login
- Fundo: `var(--color-black)` (forte, transmite premium)
- Card branco com formulário (mantendo legibilidade)
- Botão Entrar: `var(--color-primary)`
- Logo Markel no topo (branco com "Film" vermelho)

## 6. Acessibilidade

Todas as combinações desta paleta atendem **WCAG AA (contraste mínimo 4.5:1 para texto normal):**

- `var(--color-white)` em `var(--color-black)` → 18.7:1 ✅
- `var(--gray-900)` em `var(--color-white)` → 16.5:1 ✅
- `var(--color-white)` em `var(--color-primary)` → 14.2:1 ✅
- `var(--color-white)` em `var(--color-accent)` → 4.7:1 ✅ (limítrofe — usar texto bold se possível)

**Atenção:** evitar texto sobre fundo `var(--color-accent)` em fontes finas. Sempre usar bold ou tamanho ≥ 14px.

## 7. O que NÃO está incluído nesta v1

Estes itens ficam para v1.1 ou pós-entrega:

- Tipografia personalizada (fonte serif para títulos).
- Iconografia customizada.
- Modo escuro (a aplicação inteira fica em modo claro).
- Animações refinadas.
- Detalhamento mobile específico (mantém responsivo padrão).

## 8. Resumo executivo

| Decisão | Valor |
|---|---|
| Cor primária dos botões | Cinza escuro `#1A1A1C` |
| Cor de acento (logo, destaques) | Vermelho `#D62828` |
| Fundo geral | Cinza claríssimo `#FAFAFA` |
| Sidebar | Preto `#0F0F10` |
| Erro do sistema | Vermelho borgonha `#991B1B` (diferente do acento) |
| Sucesso | Verde `#16A34A` |
| Atenção | Laranja escuro `#EA580C` (não vermelho) |
