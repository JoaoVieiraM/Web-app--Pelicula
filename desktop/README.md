# Desktop — Markel Film

Pasta reservada para a futura aplicação desktop do PeliculaApp, planejada para ser construída com **Electron** em modo shell (apontando para a aplicação web hospedada na Vercel).

Status: **não iniciado**. Todo o desenvolvimento atual está na pasta `web/`.

Quando implementado, esta pasta conterá:

- `main.js` — processo principal do Electron.
- `preload.js` — ponte segura entre renderer e processo principal.
- `package.json` — dependências e scripts do app desktop.
- `assets/` — ícones e recursos do instalador.
- Scripts de build via `electron-builder` para geração de instalador `.exe`.

Consulte `docs/roadmap.md` para a ordem planejada de implementação.
