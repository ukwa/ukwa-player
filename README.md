# Browser

A mini browser that shows the usage of [webview](https://github.com/electron/electron/blob/master/docs/api/webview-tag.md)
in an app.

The app's main window contains a `<webview>` that is sized to fit most of it
(via the `width` and `height` attributes). The location bar is used to
update its `src` attribute.

`<webview>` is the preferred way for you to load web content into your app. It
runs in a separate process and has its own storage, ensuring the security and
reliability of your application.

## APIs

* [webview](https://github.com/electron/electron/blob/master/docs/api/webview-tag.md)


# UKWA Desktop Client

Idea is to use [this hook](https://github.com/electron/electron/blob/master/docs/api/app.md#appsetasdefaultprotocolclientprotocol-path-args-macos-windows) to register a special URI scheme:

    webarchive-player://oa-proxy.webarchive.org.uk:80/?url=http://www.bl.uk&timestamp=20161020120000

This then gets loaded in as a proxy (webarchive.org.uk:8090 called 'wayback') and visiting a URI at the given timestamp.

We can send the timestamp as an Accept-Datetime header as per [this example](http://stackoverflow.com/questions/35672602/how-to-set-electron-useragent), after having set the proxy as per [this example](http://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview)

More sophisticate versions could use pywb (as per [WAIL](https://github.com/N0taN3rd/wail)) and/or use a proxy that proxies requests against IA/Memento endpoints and uses the Wayback `id_` hack to return raw objects.

Use this nice date picker to pick target date: https://chmln.github.io/flatpickr/getting-started/ DONE

Add some kind of timeline of captures, a-la Wayback timeline.


https://github.com/electron-userland/electron-builder#cli-usage

./node_modules/.bin/yarn dist

How to make icns and ico: see scripts
npm install -g node-icns

https://github.com/electron-userland/electron-builder/wiki/Options#FileAssociation



