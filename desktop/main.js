const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// ── Configuração ────────────────────────────────────────────────
// Atualizar com a URL real após o deploy na Vercel
const APP_URL = 'https://SEU-PROJETO.vercel.app';
// ────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Markel Film',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Sessão nomeada persistente — mantém cookies/localStorage entre fechamentos
      partition: 'persist:markelfilm',
    },
  });

  win.loadURL(APP_URL);

  // Links externos (mailto, etc.) abrem no navegador padrão
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  buildMenu(win);
  return win;
}

function buildMenu(win) {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'F5',
          click: () => win.webContents.reload(),
        },
        {
          label: 'Forçar Recarregamento',
          accelerator: 'Ctrl+Shift+R',
          click: () => win.webContents.reloadIgnoringCache(),
        },
        { type: 'separator' },
        {
          label: 'Ferramentas de Desenvolvedor',
          accelerator: 'F12',
          click: () => win.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        {
          label: 'Tela Cheia',
          accelerator: 'F11',
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: `Sobre o Markel Film`,
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              title: 'Sobre',
              message: 'Markel Film',
              detail: `Versão ${app.getVersion()}\nGestão de películas automotivas.`,
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();

  // Auto-início com Windows (apenas no executável final, não em dev)
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
