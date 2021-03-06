# UKWA Player #

This is a basic prototype for a dedicated browser for browing archived web pages via [proxy mode](https://github.com/iipc/openwayback/wiki/Advanced-configuration). The Memento-compliant proxy looks for an `Accept-Datetime` header, and returns the closest matching archived version of the requested URL. Crucially, it does not need to re-write the links, and so should make it easier to distinguish capture problems from playback issues.

It is currently incomplete and hard-coded for use at the UK Web Archive. It allows the target date to be set, and renders the results fairly well, but does not make e.g. actual time versus target time clear.

It is based on an [Electron](https://electron.atom.io/) [example](https://github.com/hokein/electron-sample-apps/tree/master/webview/browser) that shows the usage of [webview](https://github.com/electron/electron/blob/master/docs/api/webview-tag.md) in an app.

While a standalone application may have advantages, we are also looking at [achieving the same ends using a browser extension](https://github.com/ukwa/tachyon). Closer integration with the users' browser of choice may make for a better solution overall, so we are exploring both options at present.

## Desktop integration via custom URI scheme ##

The idea is to use [this hook](https://github.com/electron/electron/blob/master/docs/api/app.md#appsetasdefaultprotocolclientprotocol-path-args-macos-windows) to register a special URI scheme:

    webarchive-player://proxy.webarchive.org.uk:80/?url=http://portico.bl.uk&timestamp=20010101120000

or

    webarchive-player://proxy.webarchive.org.uk:80/?url=http://www.bl.uk&datetime=2016-01-22T11.20.29Z&api=proxy

This should present a summary page that can be bookmarked, with a button that then switched to the proxy-mode API accessible via (oa-proxy.webarchive.org.uk:80) and visits the URI at the given timestamp.

We should also investigate supporting the [already-registered `pwid` scheme](https://www.iana.org/assignments/uri-schemes/prov/pwid). The `pwid` scheme does not appear to have been designed with this use-case in mind, so it's not clear how to map `pwid` URIs to resolvable resources. We'll develop what we need to support playback links, and look to align things later on.

## To do ##

 - [ ] Clear cache(s) as needed.
 - [ ] Display range of `Memento-Datetime` involved in rendering, and make it clear when things are a long way from the target time.
 - [ ] Finish implementing the `webarchive-player` URI scheme.
 - [ ] Finish code to always redirect to HTTP (due to OpenWayback not supporting an SSL MITM approach).
 - [ ] Display current proxy, allow proxy switching.
 - [ ] Add some kind of timeline of captures, a-la Wayback timeline.
 - [ ] Add lots of UI stuff, so it behaves as you'd expect. Hover over links to show them in status bar, buttons behaving correctly at all times, show error pages when things go wrong rather than relying on using the console, etc. etc. etc.
 - [ ] Consider whether some kind of [file association](https://github.com/electron-userland/electron-builder/wiki/Options#FileAssociation) might be a useful alternative or complement to the `webarchive-player` URI scheme.
 - [ ] Make notes on limitations (lack of plugins, Chrome-compatible HTML only, SSL issues)
 - [ ] Appropriate integration with other APIs as well as proxy mode? Noting issues raised [here](http://ws-dl.blogspot.co.uk/2016/08/2016-08-15-mementos-in-raw-take-two.html)


## Development Notes ##

https://www.christianengvall.se/electron-hello-world/

export UKWA_PLAYER_PROXY=localhost:8090

    ./node_modules/.bin/electron .

We send the timestamp as an Accept-Datetime header as per [this example](http://stackoverflow.com/questions/35672602/how-to-set-electron-useragent), after having set the proxy as per [this example](http://stackoverflow.com/questions/37393248/how-connect-to-proxy-in-electron-webview)

Uses this nice date picker to pick target date: https://chmln.github.io/flatpickr/getting-started/

This codebase also contains a rough sketch for an embedded proxy that allows Memento or Wayback instances to be used as if they were running in proxy mode. For now, we've halted work on that, prefering any such 'pseudo-proxy' to be implemented as a standalone service.

### Building the binary ###

https://github.com/electron-userland/electron-builder#cli-usage

./node_modules/.bin/yarn dist

### Making the icons ###

How to make icns and ico: see scripts
npm install -g node-icns



