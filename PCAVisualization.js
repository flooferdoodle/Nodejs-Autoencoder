const JSONSave = require('./SaveJSONObj.js');
const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./webpage/PCAVisualization.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
