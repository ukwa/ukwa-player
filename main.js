const {app, BrowserWindow, session, protocol} = require('electron');
const { URL } = require('url');
const autoUpdater = require("electron-updater").autoUpdater
//var memento = require('memento-client')

let mainWindow;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {

	var defaultProxy = '192.168.45.25:8090';
        if( process.env.UKWA_PLAYER_PROXY ) {
	  defaultProxy = process.env.UKWA_PLAYER_PROXY
        }
        console.log("Default Proxy: " + defaultProxy);


// prints given message both in the terminal console and in the DevTools
function devToolsLog(s) {
  console.log(s)
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
  }
}

  protocol.registerStringProtocol('webarchive-player', function (request, callback) {
    devToolsLog("Processing webarchive-player request...");
    // Parse URL, extract proxy location, URL and timestamp.
    const requestURL = new URL(request.url);
    const proxy = requestURL.host
    const ts = requestURL.searchParams.get('timestamp')
    // webarchive-player://proxy.webarchive.org.uk/?url=portico.bl.uk&timestamp=20080919042735
    // Convert to this format: 2011-10-10T14:48:00
    const targetDate = ts.substr(0,4)+"-"+ts.substr(4,2)+"-"+ts.substr(6,2)+"T"+ts.substr(8,2)+":"+ts.substr(10,2)+":"+ts.substr(12,2); 
    let url = requestURL.searchParams.get('url')
    if( ! url.startsWith('http') ) {
      url = "http://"+url;
    }

    devToolsLog('Got: url="' + url + '" @ targetDate="' + targetDate + '" using proxy="' + proxy + '"');

    mainWindow.webContents.send('navigateTo', { 'url': url, 'targetDate': targetDate });

    callback('It works! Got: ' + url + ' @ ' + targetDate + ' from ' + proxy);

  }, function (err) {
    if (!err) {
      console.log('Registered protocol succesfully');
    }
  });
  app.setAsDefaultProtocolClient('webarchive-player')

  // Set up the UI:
  mainWindow = new BrowserWindow({width: 1024, height: 768 });
  mainWindow.webContents.session.clearCache(function(){
      console.log("Cache cleared...");
  });
  mainWindow.webContents.session.setProxy( { proxyRules: 
  	"http=" + defaultProxy + ";https="+defaultProxy
  }, function () {
      mainWindow.loadURL('file://' + __dirname + '/browser.html');
      mainWindow.openDevTools();
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
  //session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  	// if URL is SSL bump to non-SSL
    //callback({cancel: false, redirectURL: non_ssl_url })
  //})

    //autoUpdater.checkForUpdates();

});

autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

