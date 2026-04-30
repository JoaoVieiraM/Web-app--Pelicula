# Relatório de Rebrand Visual — Markel Film

**Data:** Abril de 2026
**Escopo:** Aplicação da paleta visual Markel Film em `web/index.html` e `web/src/css/main.css`
**Branch:** `redesign`

---

## 1. Contexto

A aplicação foi renomeada de "PeliculaApp" para "Markel Film". Em paralelo ao rebrand textual, foi aplicada uma nova identidade visual baseada na logo oficial da Markel Film: **preto, vermelho e branco**, com cinzas neutros como expansão.

A paleta foi projetada para:
- Manter o vermelho como **acento comedido**, não como cor primária
- Usar preto/cinza-escuro como **cor dominante** de elementos interativos
- Separar erro de sistema (borgonha `#991B1B`) do vermelho de marca (`#D62828`) para evitar conflito visual
- Garantir **contraste WCAG AA** em todas as combinações

---

## 2. Paleta implementada

```css
:root {
  /* Cores principais */
  --color-black: #0F0F10;
  --color-red: #D62828;
  --color-white: #FFFFFF;

  /* Cinzas neutros */
  --gray-900: #1A1A1C;
  --gray-700: #3A3A3E;
  --gray-500: #71717A;
  --gray-300: #D4D4D8;
  --gray-200: #E4E4E7;
  --gray-100: #F4F4F5;
  --gray-50:  #FAFAFA;

  /* Cor primária (cinza escuro) */
  --color-primary:       #1A1A1C;
  --color-primary-hover: #000000;
  --color-primary-text:  #FFFFFF;

  /* Acento (vermelho de marca) */
  --color-accent:       #D62828;
  --color-accent-hover: #B71C1C;

  /* Cores semânticas */
  --color-success: #16A34A;
  --color-warning: #EA580C;
  --color-danger:  #991B1B;
  --color-info:    #2563EB;
}
```

---

## 3. Decisões de design tomadas durante o rebrand

| Flag | Decisão | Justificativa |
|---|---|---|
| Ícones KPI do Dashboard | **Opção A** — substituir blue/sky por slate neutro | Austero, alinhado com identidade premium |
| Cor de erro do sistema | `#DC2626` → `#991B1B` (borgonha) | Não conflitar com o vermelho de marca `#D62828` |
| Asteriscos de campo obrigatório | `#EF4444` → `var(--color-accent)` | Campo obrigatório usa acento de marca, não vermelho de erro |

---

## 4. O que foi alterado (por fase)

### Fase 2.0 — Fundação CSS
**Arquivo:** `web/src/css/main.css`
- Adicionado bloco `:root` com todas as 18 variáveis CSS da paleta Markel Film no topo do arquivo
- Nenhuma cor existente foi alterada nesta fase

---

### Fase 2.1 — Sidebar e tela de login

**`web/src/css/main.css`:**
| Seletor | Propriedade | Antes | Depois |
|---|---|---|---|
| `:root` (legado) | `--sidebar-bg` | `#0F172A` | `var(--color-black)` |
| `.sidebar-link` | `color` | `#94A3B8` | `rgba(255,255,255,0.85)` |
| `.sidebar-link:hover` | `color` | `#CBD5E1` | `var(--color-white)` |
| `.sidebar-link.active` | `background-color` | `rgba(3,105,161,0.3)` | `var(--color-accent)` |
| `.sidebar-link.active` | `color` | `#38BDF8` | `var(--color-white)` |
| `.sidebar-link.active svg` | `color` | `#38BDF8` | `var(--color-white)` |

**`web/index.html` — sidebar (inline styles):**
- Ícone logo na sidebar: `var(--primary)` → `var(--color-accent)`
- Subtítulo "Gestão de Clientes": `#64748B` → `var(--gray-500)`
- Label "Menu": `#475569` → `var(--gray-500)`
- Avatar do usuário bg: `rgba(3,105,161,0.3)` → `rgba(255,255,255,0.1)`
- Iniciais do usuário: `#7DD3FC` → `var(--color-white)`
- Role label: `#64748B` → `var(--gray-500)`
- Nome da loja: `#38BDF8` → `var(--color-accent)`
- Botão logout hover: `#F87171` → `var(--color-danger)`

**`web/index.html` — tela de login (inline styles):**
- Fundo `auth-gate`: gradient `#0F172A → #1E3A5F` → solid `var(--color-black)`
- Ícone topo do card: `#0369A1` → `var(--color-accent)`
- Subtítulo "Acesso restrito": `#94A3B8` → `var(--gray-500)`
- Botão "Entrar": `#0369A1` → `var(--color-primary)`
- Botão "Entrar" hover: `#0284C7` → `var(--color-primary-hover)`
- Link "Esqueci minha senha" hover: `#0369A1` → `var(--color-accent)`
- Botões "Enviar link" e "Salvar nova senha": mesma substituição
- Texto de erro (login-error, forgot-error, reset-error): `#DC2626` → `var(--color-danger)`
- Texto de sucesso (forgot-success): `#15803D` → `var(--color-success)`
- Ícone de cadeado (reset panel): `#16A34A` → `var(--color-success)`

---

### Fase 2.2 — Botões primários e inputs (app inteiro)

**`web/src/css/main.css`:**
- `--primary`: `#0369A1` → `var(--color-primary)` (variável legada apontando para nova paleta)
- `--primary-hover`: `#0284C7` → `var(--color-primary-hover)`
- Adicionado override CSS global de focus para inputs Tailwind:
  ```css
  input:focus, select:focus, textarea:focus {
    --tw-ring-color: rgba(26, 26, 28, 0.15);
    border-color: var(--color-primary) !important;
  }
  ```

**`web/index.html` (replace_all em todo o arquivo):**
| Padrão | Antes | Depois |
|---|---|---|
| Background de botões primários | `background:#0369A1;color:white;` | `background:var(--color-primary);color:white;` |
| Hover de botões primários | `this.style.background='#0284C7'` | `this.style.background='var(--color-primary-hover)'` |
| Mouseout de botões primários | `this.style.background='#0369A1'` | `this.style.background='var(--color-primary)'` |
| Focus de inputs inline | `onfocus="this.style.borderColor='#0369A1'"` | `onfocus="this.style.borderColor='var(--color-primary)'"` |
| Blur de inputs inline | `onblur="this.style.borderColor='#E2E8F0'"` | `onblur="this.style.borderColor='var(--gray-300)'"` |
| Borda idle de inputs inline | `border:1.5px solid #E2E8F0;` | `border:1.5px solid var(--gray-300);` |
| Checkbox accent | `accent-color:#0369A1;` | `accent-color:var(--color-primary);` |
| Focus Tailwind | `focus:border-blue-500` | `focus:border-gray-900` |

---

### Fase 2.3 — Cores de erro e asteriscos

**`web/src/css/main.css`:**
- Adicionadas regras CSS para asteriscos via Tailwind:
  ```css
  label span.text-red-500 { color: var(--color-accent) !important; }
  span.text-red-500 { color: var(--color-danger) !important; }
  ```
  - `label span.text-red-500` (maior especificidade) → acento de marca para asteriscos
  - `span.text-red-500` → borgonha para mensagens de validação ("CPF inválido")

**`web/index.html` (replace_all):**
| Padrão | Antes | Depois |
|---|---|---|
| Asteriscos inline (modais) | `style="color:#EF4444;">*` | `style="color:var(--color-accent);">*` |
| Background de caixas de erro | `background:#FEF2F2;border:1px solid #FECACA;` | `background:#FFF5F5;border:1px solid rgba(153,27,27,0.2);` |

---

### Fase 2.4 — Modais e elementos de texto (app inteiro)

**`web/index.html` (replace_all por grupo semântico):**
| Cor antiga | Mapeada para | Semântica |
|---|---|---|
| `color:#475569;border:1.5px solid #CBD5E1;` | `color:var(--gray-900);border:1.5px solid var(--gray-300);` | Botões Cancelar |
| `color:#374151;` | `color:var(--gray-700);` | Labels de formulário |
| `color:#0F172A;` | `color:var(--gray-900);` | Títulos e texto principal |
| `color:#64748B;` | `color:var(--gray-500);` | Texto secundário |
| `color:#94A3B8;` | `color:var(--gray-500);` | Hints e botões fechar |
| `color:#475569;` | `color:var(--gray-500);` | Demais textos secundários |
| `color:#CBD5E1;` | `color:var(--gray-300);` | Ícone placeholder foto |
| `1px solid #F1F5F9` | `1px solid var(--gray-100)` | Divisórias de modais |
| `background:#F1F5F9;` | `background:var(--gray-100);` | Foto preview bg |
| `background:#F8FAFC;` | `background:var(--gray-50);` | Input somente-leitura |
| `color:#16A34A;` | `color:var(--color-success);` | Ícones de sucesso |

---

### Fase 2.5 — Dashboard, KPIs, badges e timeline

**`web/src/css/main.css`:**
- Conector da timeline: `background: #E2E8F0` → `var(--gray-300)`

**`web/index.html`:**
| Elemento | Antes | Depois |
|---|---|---|
| KPI "Total Clientes" — ícone bg | `bg-blue-50` | `bg-slate-100` |
| KPI "Total Clientes" — ícone cor | `text-blue-600` | `text-slate-600` |
| KPI "Películas Ativas" — ícone bg | `bg-sky-50` | `bg-slate-100` |
| KPI "Películas Ativas" — ícone cor | `text-sky-600` | `text-slate-600` |
| Spinner de loading | `text-blue-600` | `text-slate-600` |
| Checkboxes de vidros — hover | `hover:border-blue-300` | `hover:border-slate-400` |
| Checkboxes de vidros — accent | `accent-blue-600` | `accent-gray-900` |

**Mantidos intencionalmente:**
- KPI "Instalações/Mês": `bg-emerald-50 text-emerald-600` → mapeia para `--color-success`
- KPI "Garantias a Vencer": `bg-amber-50 text-amber-500` → mapeia para `--color-warning`
- "Cliente encontrado": `bg-emerald-100 text-emerald-600 text-emerald-700` → estado de sucesso

---

### Fase 2.6 — Verificação final e cleanup

**Único item esquecido encontrado e corrigido:**
- `web/index.html` linha 1194: botão "Buscar CEP" com `border:1.5px solid #CBD5E1` isolado → `var(--gray-300)`

---

## 5. Ocorrências residuais fora do escopo (não alteradas)

### `web/src/js/app.js` — **Fora de escopo (JS)**
O prompt proibiu explicitamente alterações em JavaScript. As seguintes cores permanecem em `app.js` e devem ser tratadas em uma tarefa separada:

| Linha | Cor | Elemento | Substituto sugerido |
|---|---|---|---|
| 674 | `#0369A1` | Hover de botão inline gerado por JS | `var(--color-primary)` |
| 747 | `#0369A1` | Borda do header do PDF (invoice) | `var(--color-accent)` |
| 748 | `#0369A1` | Nome da marca no PDF | `var(--color-accent)` |
| 753 | `#0369A1` | Título do PDF | `var(--color-accent)` |
| 758 | `#0369A1` | Valor de meta no PDF | `var(--color-accent)` |
| 1843 | `#0369A1` | Botão "Editar" na lista de instaladores | `var(--color-primary)` |
| 654, 1774, 1827 | `#E2E8F0` | Avatar bg (fallback sem foto) | `var(--gray-200)` |
| 654, 1774, 1827 | `#64748B` | Iniciais do avatar | `var(--gray-500)` |
| 1283 | `#EF4444` | Botão "Excluir" usuário (destrutivo) | `var(--color-danger)` |
| 417-418 | `bg-blue-100 text-blue-700` | Avatar do cliente (card de busca) | `bg-slate-100 text-slate-700` |
| 443 | `hover:border-blue-300` | Card de veículo hover | `hover:border-slate-400` |
| 531 | `text-blue-600 hover:text-blue-800` | Link "Ver instalações" | `var(--color-primary)` |
| 1259 | `bg-blue-100 text-blue-700` | Badge "Admin" | `bg-slate-100 text-slate-700` |

### `web/src/css/invoice.css` — **Pendente de decisão**
O arquivo de estilos do PDF de vendas ainda usa cores do esquema antigo. Como é um documento impresso (não UI interativa), foi mantido fora do escopo desta tarefa. Recomenda-se uma tarefa separada para atualizar:
- `#0369A1` (3 ocorrências) → `var(--color-accent)` ou `#D62828`
- `#0F172A`, `#64748B`, `#475569`, `#94A3B8` → tokens correspondentes
- `#E2E8F0` (3 ocorrências) → `var(--gray-200)` ou `var(--gray-300)`

---

## 6. Resumo quantitativo

| Métrica | Valor |
|---|---|
| Variáveis CSS adicionadas | 18 |
| Arquivos modificados | 2 (`main.css`, `index.html`) |
| Substituições em `index.html` | ~180 ocorrências |
| Substituições em `main.css` | 9 linhas + 3 blocos adicionados |
| Cores removidas do `index.html` | 14 valores hex diferentes |
| Cores mantidas intencionalmente | Emerald (success), Amber (warning), RGBA de overlay |
| Itens fora de escopo (JS) | 14 ocorrências em `app.js` |
| Pendência (`invoice.css`) | 12 ocorrências |

---

## 7. Sugestão de próximas tarefas

1. **Rebrand em `app.js`** — aplicar a nova paleta nos elementos HTML gerados dinamicamente por JavaScript
2. **Rebrand em `invoice.css`** — atualizar o PDF de vendas com a nova identidade visual
3. **Tipografia** — avaliar fonte serifada para títulos (previsto para v1.1 no design system)
4. **Modo escuro** — não estava no escopo desta v1

---

*Relatório gerado em Abril de 2026 — Markel Film v1 rebrand*
