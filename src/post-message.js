// eslint-disable-next-line no-unused-vars
import Message from './messages/message.js';

const NS = {
  ANDROID: 'bannoAndroidBridge',
  IOS: 'bannoIOSBridge',
};

// Android will pass us a port that we should use to send messages
let port;
function portListener(event) {
  if (event.ports && event.ports[0]) {
    [port] = event.ports;
    window.removeEventListener('message', portListener);
  }
}
window.addEventListener('message', portListener);

/**
 * post a message to the host application
 * @param {Message} message
 * @return {boolean} message sent flag
 */
function postUniversalMessage(message) {
  // if modern Android, we should have a port.
  // if legacy Android, we should have a 'bannoAndroidBridge' namespace.
  // if iOS, we should have a webkit.messageHandlers.bannoBridge namespace.
  // for browsers, use regular postMessage.
  if (port) {
    port.postMessage(JSON.stringify(message));
  } else if (window[NS.ANDROID] && window[NS.ANDROID].postMessage) {
    window[NS.ANDROID].postMessage(JSON.stringify(message));
    // @ts-ignore
  } else if (window.webkit && window.webkit.messageHandlers[NS.IOS]) {
    // @ts-ignore
    window.webkit.messageHandlers[NS.IOS].postMessage(message);
  } else if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  } else {
    return false;
  }
  return true;
}

/**
 * post a message that expects a return response. host must attach id to response.
 * @param {Message} message
 * @param {number} [wait=1000] - time in ms to wait for a response
 * @return {Promise<Message>}
 */
function postAsyncMessage(message, wait = 1000) {
  return new Promise((resolve, reject) => {
    const id = String(Math.random() * 100000);
    const timeout = setTimeout(() => {
      reject(message);
    }, wait);
    const responder = event => {
      if (event.data.id === id) {
        clearTimeout(timeout);
        resolve(event.data);
        window.removeEventListener('message', responder);
      }
    };
    window.addEventListener('message', responder);
    postUniversalMessage(/** @type {!Message} */ ({ id, ...message }));
  });
}

export { postUniversalMessage, postAsyncMessage };
