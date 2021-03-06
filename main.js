const {app, BrowserWindow, session, protocol} = require('electron');
const { URL } = require('url');
const autoUpdater = require("electron-updater").autoUpdater
const {ipcMain} = require('electron')
const path = require('path')
//var memento = require('memento-client')

let mainWindow;
let targetDate;

// Process any command-line arguments
if (process.argv.length > 0) {
  // Keep only the first command line argument:
  for (var i = 0; i < process.argv.length; i++) {
    clarg = process.argv[i];
    if( clarg.startsWith("webarchive-player:") ) {
      cliUrl = clarg;
      break;
    }
  }
}

// Twitter not rendering. Tried this.
// See https://github.com/electron/electron/issues/25421
app.allowRendererProcessReuse = false;

// 
app.on('window-all-closed', function() {
  app.quit();
});

//
function createWindow () {

	var defaultProxy = '192.168.45.25:8090';
  if( process.env.UKWA_PLAYER_PROXY ) {
	  defaultProxy = process.env.UKWA_PLAYER_PROXY
  }
  console.log("Default Proxy: " + defaultProxy);

  // Set up the UI:
  mainWindow = new BrowserWindow({width: 1024, height: 768, show: false, 
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webviewTag: true,
      devTools: true,
      worldSafeExecuteJavaScript: true
    }});
  console.log("Attempting to load...");
  mainWindow.loadFile('browser.html');
  mainWindow.webContents.openDevTools();

  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    event.preventDefault();
    console.log("open-url: " + url);
    mainWindow.webContents.send('navigateTo', url);
  });

  protocol.registerStringProtocol('webarchive-player', function (request) {
    console.log('request.url: ' + request.url);
    mainWindow.webContents.send('navigateTo', request.url);
    callback('It works! Got: ' + request.url);
  });
  app.setAsDefaultProtocolClient('webarchive-player')

  mainWindow.webContents.session.clearCache(function(){
      console.log("Cache cleared...");
  });
  //mainWindow.webContents.session.setProxy( { proxyRules: 
  //	"http=" + defaultProxy + ";https="+defaultProxy
  //});
  
  filter =   {
    urls: [
      '*://*/*',
    ],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    let reqHeaders = Object.assign({}, details.requestHeaders);
    if( targetDate ) {
      console.log("Intercepting with date: " + targetDate);
      //reqHeaders['Accept-Datetime'] = new Date(targetDate).toUTCString();
    } 
    callback({cancel: false, requestHeaders: reqHeaders})
  })

  // Pass in any CLI arg when we are ready:
  mainWindow.once('ready-to-show', () => {
    if( typeof cliUrl !== "undefined" && cliUrl != null ) {
      console.log("cliUrl: " + cliUrl);
      mainWindow.webContents.send('navigateTo', cliUrl);
    }
    mainWindow.show()
  });
  // Disable certificate verification:
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    callback(0)
  });
  //session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  	// if URL is SSL bump to non-SSL
    //callback({cancel: false, redirectURL: non_ssl_url })
  //})

    //autoUpdater.checkForUpdates();
  
}


//
app.whenReady().then(createWindow)

ipcMain.on('open-dev-tools', (event, arg) => {
    console.log(arg)
    mainWindow.openDevTools();
})

ipcMain.on('clear-cache', (event, arg) => {
  console.log('clear cache: ' + arg)
  mainWindow.webContents.session.clearCache(function(){
    console.log("Cache cleared...");
  });
})

ipcMain.on('set-target-date', (event, arg) => {
  console.log('set-target-date: ' + arg);
  if ( arg.length == 1) {
    targetDate = arg[0];
  }
})



autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

