# Correções Electron — Markel Film

Data: 2026-05-27

## Contexto

Durante revisão de código pré-implantação, foram identificados dois problemas exclusivos do ambiente Electron que não se manifestam em browser convencional.

---

## Correção 1 — `alert()` e `confirm()` via IPC

### Problema

O `app.js` usa `window.alert()` e `window.confirm()` em vários pontos (validações, erros, confirmação de exclusão de usuário). No Electron com `contextIsolation: true` carregando uma URL remota (Vercel), essas funções nativas do browser podem ser silenciosamente bloqueadas — sem mostrar nada ao usuário e sem lançar erro.

O impacto mais crítico era na exclusão de usuários (`app.js:1414`): se `confirm()` retornasse `undefined` em vez de `true/false`, a exclusão nunca seria executada.

### Solução

Comunicação via IPC entre o renderer (página Vercel) e o processo principal do Electron, usando os diálogos nativos do sistema operacional.

**Arquivos alterados:**

- `desktop/preload.js` — expõe `electronApp.alert` e `electronApp.confirm` via `contextBridge`, chamando `ipcRenderer.invoke`
- `desktop/main.js` — registra handlers `ipcMain.handle('dialog:alert')` e `ipcMain.handle('dialog:confirm')` que abrem `dialog.showMessageBoxSync` com os botões corretos
- `web/src/js/app.js` — adiciona no topo um bloco que, se estiver rodando dentro do Electron (`window.electronApp?.isDesktop`), sobrescreve `window.alert` e `window.confirm` com as versões IPC

Dessa forma, todo o código existente no `app.js` continua funcionando sem nenhuma alteração nas chamadas individuais.

---

## Correção 2 — DevTools desabilitado em produção

### Problema

O menu do Electron expunha "Ferramentas de Desenvolvedor" (F12) e "Forçar Recarregamento" (Ctrl+Shift+R) para qualquer usuário, inclusive nos PCs das lojas. Isso permitia que qualquer funcionário abrisse o DevTools e tivesse acesso à chave anon do Supabase, ao estado da sessão e à capacidade de modificar o DOM.

### Solução

Em `desktop/main.js`, os itens de desenvolvedor no menu são condicionados a `!app.isPackaged`. A propriedade `app.isPackaged` é `false` em desenvolvimento (rodando via `npm start`) e `true` no executável final gerado pelo electron-builder.

- Em desenvolvimento: F12 e Ctrl+Shift+R continuam disponíveis normalmente
- No `.exe` instalado nas lojas: os itens não aparecem no menu e os atalhos não funcionam

---

## Arquivos modificados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `desktop/preload.js` | Adicionado `ipcRenderer` e exposição de `alert`/`confirm` via `contextBridge` |
| `desktop/main.js` | Adicionado `ipcMain`, handlers IPC, variável `mainWindow`, e condição `app.isPackaged` no menu |
| `web/src/js/app.js` | Adicionado bloco de override de `window.alert`/`window.confirm` no topo do script |
