# Relatório de Correção — Bugs C1 e C2

**Branch:** `redesign`
**Data:** 2026-05-14
**Arquivos alterados:** `web/index.html`, `web/src/js/app.js`

---

## Bug C1 — Páginas duplicadas (Instaladores aparecia junto com outras seções)

### Sintoma

Ao navegar para a seção **Instaladores** e depois para qualquer outra seção (ex: Busca de Clientes), o conteúdo de Instaladores continuava visível no rodapé da página. Inspecionando o DOM, mais de uma `<div class="page">` possuía a classe `active` simultaneamente.

### Causa-raiz

**Arquivo:** `web/index.html`, linha 1447

A função `navigate()` remove a classe `active` iterando sobre um array hardcoded chamado `pages`:

```javascript
pages.forEach(p => {
  const el = document.getElementById('page-' + p);
  if (el) el.classList.remove('active');
});
```

O array não incluía `'instaladores'`:

```javascript
// ANTES — 'instaladores' ausente
const pages = ['dashboard','busca','novo-cliente','perfil','novo-veiculo','veiculo','nova-instalacao','tipos','usuarios'];
```

Resultado: quando o usuário navegava para `page-instaladores`, a classe `active` era adicionada corretamente. Mas ao navegar para outra página, o `forEach` nunca encontrava `page-instaladores` para removê-la — ela permanecia visível junto com o destino.

### Correção

```javascript
// DEPOIS — 'instaladores' incluído
const pages = ['dashboard','busca','novo-cliente','perfil','novo-veiculo','veiculo','nova-instalacao','tipos','usuarios','instaladores'];
```

**Mudança:** 1 item adicionado ao array `pages` na linha 1447 de `web/index.html`.

---

## Bug C2 — Logout deixava botão de login travado em "Entrando..."

### Sintoma

Após clicar em **Sair**, a tela de login reabria com o botão travado em estado de loading (spinner + texto "Entrando..." + `disabled`), sem o usuário ter clicado em nada. Apenas um F5 resetava o estado.

### Causa-raiz

**Arquivo:** `web/src/js/app.js`, linhas 27-30 e 62-63

A função `handleLogin()` muta o botão para estado de loading antes de chamar o Supabase:

```javascript
btn.disabled = true;
btn.innerHTML = '<svg class="animate-spin">...</svg> Entrando...';
```

Em caso de **erro**, o botão era restaurado manualmente (linhas 77-78). Em caso de **sucesso**, o código assumia que o `onAuthStateChange` cuidaria disso — mas o listener apenas chama `showApp()`, que esconde a tela de login sem tocar no DOM do botão.

Quando o usuário fazia logout:
- `handleLogout()` → `sb.auth.signOut()`
- `onAuthStateChange(session=null)` → `showLogin()`
- `showLogin()` reexibia o `#auth-gate` — mas o botão ainda estava com `disabled=true` e o innerHTML do spinner intactos.

```javascript
// ANTES — showLogin() não resetava o botão
function showLogin() {
  document.getElementById('auth-gate').style.display    = 'flex';
  document.getElementById('app-container').style.display = 'none';
}
```

### Correção

```javascript
// DEPOIS — showLogin() reseta o estado completo do formulário
function showLogin() {
  document.getElementById('auth-gate').style.display    = 'flex';
  document.getElementById('app-container').style.display = 'none';

  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.disabled  = false;
    btn.innerHTML = '<svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg> Entrar';
  }

  const errEl = document.getElementById('login-error');
  if (errEl) errEl.style.display = 'none';
}
```

A correção centraliza o reset do formulário em `showLogin()`, cobrindo todos os cenários que reexibem a tela: logout normal, expiração de sessão, ou qualquer outro evento de `onAuthStateChange`.

**Mudança:** função `showLogin()` expandida nas linhas 27-30 de `web/src/js/app.js`.

---

## Resumo das alterações

| Bug | Arquivo | Linha | Tipo de mudança |
|-----|---------|-------|-----------------|
| C1 | `web/index.html` | 1447 | Adicionar `'instaladores'` ao array `pages` |
| C2 | `web/src/js/app.js` | 27-30 | Expandir `showLogin()` para resetar estado do botão e limpar erros |
