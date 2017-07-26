const {app, BrowserWindow, session} = require('electron');

let mainWindow;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1024, height: 768 });
  mainWindow.webContents.session.clearCache(function(){
      console.log("Cache cleared...");
  });
  mainWindow.webContents.session.setProxy( { proxyRules: 
  	"http=localhost:18090;https=localhost:18090"
  }, function () {
      mainWindow.loadURL('file://' + __dirname + '/browser.html');
      mainWindow.openDevTools();
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  	var targetDate = mainWindow.webContents.executeJavaScript("document.querySelector('#target-date').value", function (result) {
      console.log("Intercept...");
	  console.log(result)
      details.requestHeaders['Accept-Datetime'] = new Date(result).toUTCString();
      console.log(details)
      callback({cancel: false, requestHeaders: details.requestHeaders})
	});
  })
});
