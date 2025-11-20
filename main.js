const { app, BrowserWindow } = require("electron");
const path = require("path");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 780,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: "#06080f",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
