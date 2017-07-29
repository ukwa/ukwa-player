 /* Experimental internal proxy that relays requests to a Wayback instance */

    // Set up a /pseudo-proxy/
	var http = require('http'),
	    https = require('https'),
	    httpProxy = require('http-proxy');

	//
	// Create a proxy server with custom application logic
	//
	var proxy = httpProxy.createProxyServer({});

	// To modify the proxy connection before data is sent, you can listen
	// for the 'proxyReq' event. When the event is fired, you will receive
	// the following arguments:
	// (http.ClientRequest proxyReq, http.IncomingMessage req,
	//  http.ServerResponse res, Object options). This mechanism is useful when
	// you need to modify the proxy request before the proxy connection
	// is made to the target.
	//
	//proxy.on('proxyReq', function(proxyReq, req, res, options) {
	//	url = req.url
	//    proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
	//    console.log("proxyReq req")
	//	console.log(req.url)
	//});

	proxy.on('proxyRes', function (proxyRes, req, res) {
      console.log('Response from the target', JSON.stringify(req.url, true, 2));
    //  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    });
	proxy.on('error', function (err, req, res) {
      console.log('ERROR', JSON.stringify(err, true, 2));
    });

	var server = http.createServer(function(req, res) {
      // You can define here your custom logic to handle the request
      // and then proxy the request.

		if( ! req.url.startsWith('https://web.archive.org/') ) {
	    	console.log("req")
			console.log(req.url)
  			req.headers.host = 'web.archive.org'
		    // Look up items by time, and map request to precide timestamp
			// req.url =  'https://web.archive.org/web/20020121085054id_/' + req.url
			var options = {method: 'HEAD', host: 'web.archive.org', port: 443, path: '/web/19960000000000id_/' + req.url };
			var reqi = https.request(options, function(resi) {
				console.log('STATUS: ' + resi.statusCode);
                console.log('HEADERS: ' + JSON.stringify(resi.headers.location));
				if( resi.headers.location ) {
					req.url = resi.headers.location.replace(/^"(.*)"$/, '$1');
				}
			console.log("GETTING VIA " + req.url)
		    // THEN: proxy it to that exact instance and it will work fine:
	        proxy.web(req, res, {
	          target: "https://web.archive.org"
	        });
			  }
			);
			reqi.end();
	    } else {
			console.log("GETTING " + req.url)
	        proxy.web(req, res, {
	          target: "https://web.archive.org"
	        });
    	}
    });


	console.log("listening on port 18081")
	server.listen(18081);
