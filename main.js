const {app, BrowserWindow, session, protocol} = require('electron');
const { URL } = require('url');
var memento = require('memento-client')

let mainWindow;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {

	const defaultProxy = 'localhost:8090';// 'crawler01.bl.uk:8090';

  protocol.registerStringProtocol('webarchive-player', function (request, callback) {
    const requestURL = new URL(request.url);
    const proxy = requestURL.host
    const url = requestURL.searchParams.get('url')
    const timestamp = requestURL.searchParams.get('timestamp')
    // Parse URL, extract proxy location, URL and timestamp.

    console.log('url: %s', url);

    mainWindow.webContents.executeJavaScript("document.querySelector('#target-date').value = " + timestamp, 
    	function (result) { 
    		console.log(result)
    	});
    mainWindow.webContents.executeJavaScript("document.querySelector('#location').value = " + url);

    callback('It works! Got: ' + url + ' @ ' + timestamp + ' from ' + proxy);
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
      //mainWindow.openDevTools();
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  	var targetDate = mainWindow.webContents.executeJavaScript("document.querySelector('#target-date').value", function (result) {
      //console.log("Intercept...");
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
});
