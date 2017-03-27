const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1024, height: 768 });
  mainWindow.webContents.session.setProxy({proxyRules:"http=localhost:18090,https=localhost:18090"}, function () {
      mainWindow.loadURL('file://' + __dirname + '/browser.html');
      //mainWindow.openDevTools();
  });
});
