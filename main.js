const {app, BrowserWindow, session, protocol} = require('electron');
const { URL } = require('url');
const autoUpdater = require("electron-updater").autoUpdater
const {ipcMain} = require('electron')
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
app.on('ready', function() {

	var defaultProxy = '192.168.45.25:8090';
  if( process.env.UKWA_PLAYER_PROXY ) {
	  defaultProxy = process.env.UKWA_PLAYER_PROXY
  }
  devToolsLog("Default Proxy: " + defaultProxy);

  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    event.preventDefault();
    devToolsLog("open-url: " + url);
    mainWindow.webContents.send('navigateTo', url);
  });

  protocol.registerStringProtocol('webarchive-player', function (request, callback) {
    devToolsLog('request.url: ' + request.url);
    mainWindow.webContents.send('navigateTo', request.url);
    callback('It works! Got: ' + request.url);
  }, function (err) {
    if (!err) {
      console.log('Registered protocol succesfully');
    }
  });
  app.setAsDefaultProtocolClient('webarchive-player')

  // Set up the UI:
  mainWindow = new BrowserWindow({width: 1024, height: 768, show: false });
  mainWindow.webContents.session.clearCache(function(){
      console.log("Cache cleared...");
  });
  mainWindow.webContents.session.setProxy( { proxyRules: 
  	"http=" + defaultProxy + ";https="+defaultProxy
  }, function () {
      mainWindow.loadURL('file://' + __dirname + '/browser.html');
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  	mainWindow.webContents.executeJavaScript("document.querySelector('#target-date').value", function (result) {
    console.log("Intercepting with date: " + result);
	  if ( result ) {
          details.requestHeaders['Accept-Datetime'] = new Date(result).toUTCString();
      }
      callback({cancel: false, requestHeaders: details.requestHeaders})
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
  //session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  	// if URL is SSL bump to non-SSL
    //callback({cancel: false, redirectURL: non_ssl_url })
  //})

    //autoUpdater.checkForUpdates();


});

ipcMain.on('open-dev-tools', (event, arg) => {
    console.log(arg)
    mainWindow.openDevTools();
})

autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

