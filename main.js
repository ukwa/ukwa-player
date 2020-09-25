const {app, BrowserWindow, session, protocol} = require('electron');
const { URL } = require('url');
const autoUpdater = require("electron-updater").autoUpdater
const {ipcMain} = require('electron')
const path = require('path')
//var memento = require('memento-client')

let mainWindow;

// prints given message both in the terminal console and in the DevTools
function devToolsLog(s) {
  console.log(s)
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
  }
}

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
  devToolsLog("Default Proxy: " + defaultProxy);

  // Set up the UI:
  mainWindow = new BrowserWindow({width: 1024, height: 768, show: true, webPreferences: {
    nodeIntegration: true
  }});
  console.log("Attempting to load...");
  mainWindow.loadFile('browser.html');
  mainWindow.webContents.openDevTools();

  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    event.preventDefault();
    devToolsLog("open-url: " + url);
    mainWindow.webContents.send('navigateTo', url);
  });

  protocol.registerStringProtocol('webarchive-player', function (request) {
    devToolsLog('request.url: ' + request.url);
    mainWindow.webContents.send('navigateTo', request.url);
    callback('It works! Got: ' + request.url);
  });
  app.setAsDefaultProtocolClient('webarchive-player')

  mainWindow.webContents.session.clearCache(function(){
      console.log("Cache cleared...");
  });
  mainWindow.webContents.session.setProxy( { proxyRules: 
  	"http=" + defaultProxy + ";https="+defaultProxy
  });
  
  filter =   {
    urls: [
      '*://*/*',
    ],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  	mainWindow.webContents.executeJavaScript("document.querySelector('#target-date').value", function (result) {
      console.log("Intercepting with date: " + result);

      let reqHeaders = Object.assign({}, details.requestHeaders);
	    if ( result ) {
        reqHeaders['Accept-Datetime'] = new Date(result).toUTCString();
      }
      callback({cancel: false, requestHeaders: reqHeaders})
	  });
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
  console.log(arg)
  mainWindow.webContents.session.clearCache(function(){
    console.log("Cache cleared...");
  });
})


autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

