const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApp', {
  isDesktop: true,
  alert:   (msg) => ipcRenderer.invoke('dialog:alert',   msg),
  confirm: (msg) => ipcRenderer.invoke('dialog:confirm', msg),
});
