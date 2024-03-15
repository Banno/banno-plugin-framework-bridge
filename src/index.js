import { postUniversalMessage } from './post-message.js';
import ClickLink from './messages/click-link.js';
import RequestResize from './messages/request-resize.js';
import enableRouter from './router.js';
import Message from './messages/message.js';

const MESSAGES = {
  REQUEST_CLOSE: 'request-close',
  REQUEST_SYNC: 'request-sync',
  REQUEST_REFRESH: 'request-refresh',
  PING: 'ping',
  READY: 'ready',
};

/**
 * request that the frame is closed
 */
function requestClose() {
  postUniversalMessage(new Message(MESSAGES.REQUEST_CLOSE));
}

/**
 * request that the host perform a sync
 */
function requestSync() {
  postUniversalMessage(new Message(MESSAGES.REQUEST_SYNC));
}

/**
 * request that the host perform a refresh of the component
 */
function requestRefresh() {
  postUniversalMessage(new Message(MESSAGES.REQUEST_REFRESH));
}

/**
 * ping the host. In Online, triggers the activity monitor.
 */
function ping() {
  postUniversalMessage(new Message(MESSAGES.PING));
}

/**
 * request that the host perform a resize
 * @param {number} height
 */

function requestResize(height) {
  postUniversalMessage(new RequestResize(height));
}

/**
 * tell the host we're "ready". Typically used to allow the host to handle an initial loading screen.
 */
function ready() {
  postUniversalMessage(new Message(MESSAGES.READY));
}

/**
 * handle clicking internal route hrefs
 * @param {Event} e
 */
function handleClick(e) {
  const event = /** @type {!CustomEvent} */ (e);
  event.detail.originalEvent.preventDefault();
  postUniversalMessage(new ClickLink(event.detail.href));
}

// we should only add these listeners if we are running in an iframe (Online)
// eslint-disable-next-line no-restricted-globals
if (window !== top) {
  document.addEventListener('click-link', handleClick, false);
  // listen for user activity and ping host for session keep-alive in Online
  const onActivity_ = () => {
    ping();
  };

  const onFocus_ = () => {
    if (document.hidden === false) {
      ping();
    }
  };
  document.addEventListener('mousedown', onActivity_, { passive: true });
  document.addEventListener('keydown', onActivity_, { passive: true });
  document.addEventListener('visibilitychange', onFocus_, { passive: true });
}

/** just enough event dispatcher. EventTarget isn't widely supported enough (safari and IE11) */
class EventDispatcher {
  constructor() {
    this.listeners = {};
  }

  /**
   * @param {!string} eventName
   * @param {function(Event?):void} callback
   */
  addEventListener(eventName, callback) {
    this.listeners[eventName] = this.listeners[eventName]
      ? this.listeners[eventName].concat([callback])
      : [callback];
  }

  /**
   * @param {!string} eventName
   * @param {function(Event?):void} callback
   */
  removeEventListener(eventName, callback) {
    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
  }

  /**
   *
   * @param {Event} event
   * @return {boolean}
   */
  dispatchEvent(event) {
    const { type } = event;
    // does NOT handle stopPropagation/stopImmediatePropagation
    (this.listeners[type] || []).forEach(listener => listener(event));
    return !event.defaultPrevented;
  }
}

/** @type {EventDispatcher} */
const host = new EventDispatcher();

/** @type {!Object<string, string>} */
const HOST_EVENTS = {
  HISTORY_BACK: 'history-back',
  HISTORY_FORWARD: 'history-forward',
};

// listen for messages from our host and relay as events
window.addEventListener('message', event => {
  host.dispatchEvent(new CustomEvent(event.data.type, { detail: event.data.data }));
});

export {
  requestClose,
  requestSync,
  postUniversalMessage,
  ping,
  ready,
  requestResize,
  host,
  HOST_EVENTS,
  enableRouter,
};
