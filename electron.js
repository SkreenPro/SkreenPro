const { app, BrowserWindow, ipcMain, desktopCapturer, Tray, Menu, screen, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let editorWindow = null;
let captureWindow = null;
let overlayWindow = null;
let tray = null;

// Capture toolbar oluştur (küçük toolbar)
function createCaptureWindow() {
  // Eğer zaten açık bir capture window varsa, kapat
  if (captureWindow) {
    captureWindow.close();
    captureWindow = null;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;

  // Küçük toolbar boyutları
  const toolbarWidth = 280;
  const toolbarHeight = 70;
  const toolbarX = Math.floor((screenWidth - toolbarWidth) / 2);
  const toolbarY = screenHeight - toolbarHeight - 40; // Alt kısımda, biraz yukarıda

  captureWindow = new BrowserWindow({
    width: toolbarWidth,
    height: toolbarHeight,
    x: toolbarX,
    y: toolbarY,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  captureWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  captureWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  if (isDev) {
    captureWindow.loadURL('http://localhost:5173/#/toolbar');
  } else {
    captureWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'), {
      hash: 'toolbar'
    });
  }

  captureWindow.on('closed', () => {
    captureWindow = null;
  });
}

// Fullscreen overlay oluştur (area selection için)
function createOverlayWindow() {
  // Eğer zaten açık bir overlay varsa, kapat
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.bounds;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#/capture');
  } else {
    overlayWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'), {
      hash: 'capture'
    });
  }

  // Toolbar'ı kapat
  if (captureWindow) {
    captureWindow.close();
    captureWindow = null;
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

// Editor window oluştur (sadece screenshot ile)
function createEditorWindow(screenshotData) {
  // Screenshot yoksa editor açma
  if (!screenshotData) {
    console.log('No screenshot data, not opening editor');
    return;
  }

  // Eğer editor zaten açıksa, sadece screenshot'ı güncelle
  if (editorWindow) {
    editorWindow.focus();
    editorWindow.webContents.send('screenshot-captured', screenshotData);
    return;
  }

  editorWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    editorWindow.loadURL('http://localhost:5173');
    editorWindow.webContents.openDevTools();
  } else {
    editorWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
  }

  editorWindow.once('ready-to-show', () => {
    editorWindow.show();
    // Screenshot'ı gönder
    editorWindow.webContents.send('screenshot-captured', screenshotData);
  });

  editorWindow.on('closed', () => {
    editorWindow = null;
  });
}

// Tray oluştur
function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  if (process.platform === 'darwin') {
    tray.setTitle('📸');
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture Screenshot',
      accelerator: 'CommandOrControl+Shift+5',
      click: () => {
        createCaptureWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CommandOrControl+Q',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Screenshot Editor - Click to capture');
  tray.setContextMenu(contextMenu);

  // Tray ikonuna tıklandığında capture window aç
  tray.on('click', () => {
    createCaptureWindow();
  });
}

// App hazır olduğunda
app.whenReady().then(() => {
  createTray();

  // Global shortcut
  globalShortcut.register('CommandOrControl+Shift+5', () => {
    createCaptureWindow();
  });

  // macOS'ta dock'u gizle
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

// Tüm pencereler kapandığında
app.on('window-all-closed', () => {
  // Menu bar uygulaması olduğu için çıkma
});

// Quit edildiğinde
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC Handlers

// Ekran görüntüsünü yakala
ipcMain.handle('capture-screen', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().size,
    });

    if (sources.length > 0) {
      return sources[0].thumbnail.toDataURL();
    }
    return null;
  } catch (error) {
    console.error('Error capturing screen:', error);
    return null;
  }
});

// Capture mode seçildi
ipcMain.on('start-capture-mode', (event, mode) => {
  console.log('Capture mode:', mode);

  if (mode === 'fullscreen') {
    // Tam ekran screenshot al
    desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().size,
    }).then(sources => {
      if (sources.length > 0) {
        const screenshot = sources[0].thumbnail.toDataURL();

        // Toolbar'ı kapat
        if (captureWindow) {
          captureWindow.close();
          captureWindow = null;
        }

        // Editor'ü aç
        createEditorWindow(screenshot);
      }
    });
  } else if (mode === 'area') {
    // Alan seçimi için overlay aç
    createOverlayWindow();
  } else if (mode === 'window') {
    // Window screenshot için overlay aç (şimdilik area ile aynı)
    createOverlayWindow();
  }
});

// Screenshot seçildi - editor'ü aç
ipcMain.on('screenshot-selected', (event, imageData) => {
  console.log('Screenshot selected, opening editor');

  // Tüm capture pencerelerini kapat
  BrowserWindow.getAllWindows().forEach(win => {
    if (win !== editorWindow) {
      win.close();
    }
  });

  captureWindow = null;

  // Editor'ü screenshot ile aç
  createEditorWindow(imageData);
});

// Capture iptal edildi
ipcMain.on('cancel-capture', () => {
  console.log('Capture cancelled');

  // Tüm capture pencerelerini kapat
  BrowserWindow.getAllWindows().forEach(win => {
    if (win !== editorWindow) {
      win.close();
    }
  });

  captureWindow = null;
});
