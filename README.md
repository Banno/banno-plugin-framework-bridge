# @jack-henry/banno-plugin-framework-bridge

A javascript module to interface between a Banno Plugin webview and the host application.

## Host events

Host applications can send the web-app the following events:

`history-back` - 'back' navigation occured.

`history-forward` - 'forward' navigation occured.

## App events

The web app can dispatch the following events up to the host application:

`click-link` - `{href: 'https://target', external:boolean}` - A routeable link was clicked within the app. If external is true, link will be opened in a new tab window in Banno Online or an external browser on Banno Mobile.

`ping` - Occurs periodically to prevent the host app from timing out due to inactivity.

`ready` - The web app has finished loading it's assets and initial data. Used for hiding native loading indicators.

`request-close` - The web app would like to be closed. Not valid in all browsing contexts.

`request-resize` - The web app has been resized and is reporting it's new height.

`request-sync` - The web app needs the host to perform a sync.

## Routing

The app contains a small router to automatically convert html `<a>` tag clicks into app `click-link` events.

To enable the router, add the following code:

```html
<script type="module">
  import {enableRouter} from '/js/banno-plugin-framework-bridge.js';
  enableRouter();
</script>
```

Anchor tags will be automatically converted.

An anchor without a `target` attribute will be treated normally. The link will target the same frame and not message the host app.
```html
<a href="/some-link">Normal link - will target the same frame</a>
```

An anchor with a `target="_top"` attribute will be intercepted and converted into an internal app deep link. This can be used to open a full screen web view with more plugin content.
```html
<a href="/deep-link" target="_top">App deep link - internal</a>
```

An anchor with a `target="_blank"` attribute will be intercepted and converted into an external app link. In Banno Online, the link will open in a new tab where on Banno Mobile, the link will open in an embedded web browser. Since the internal web view and embedded browser do not share cookie storage, in Mobile, the user will be un-authenticated.
```html
<a href="/external-link" target="_blank">App external link</a>
```
