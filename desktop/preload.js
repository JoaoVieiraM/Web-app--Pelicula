// preload.js — Bridge de segurança mínima
// contextIsolation: true garante isolamento total entre renderer e Node.js
// O app carrega a Vercel URL diretamente; não é necessário IPC por enquanto.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronApp', {
  isDesktop: true,
});
