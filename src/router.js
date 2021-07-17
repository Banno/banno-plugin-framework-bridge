import ClickLink from './messages/click-link.js';
import { postUniversalMessage } from './post-message.js';

const LINK_TARGET_TYPE = {
  SAME_WINDOW: 0,
  NEW_WINDOW: 1,
};

/** @param {!Event} event */
function clickEventHandler(event) {
  if (event.type !== 'click') {
    return;
  }
  const e = /** @type {MouseEvent} */ (event);
  let targetType = LINK_TARGET_TYPE.SAME_WINDOW;
  if ((e.which === null ? e.button : e.which) !== 1) {
    // this is a right or middle click - don't do anything
    return;
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey) {
    targetType = LINK_TARGET_TYPE.NEW_WINDOW;
  }

  if (e.defaultPrevented) {
    return;
  }

  // ensure link
  // use shadow dom when available
  let eventTarget = /** @type {HTMLElement} */ (e.target);
  if (eventTarget.nodeName !== 'A') {
    const composedPath = e.composedPath();
    for (let i = 0; i < composedPath.length; i += 1) {
      eventTarget = /** @type {HTMLElement} */ (composedPath[i]);
      if (eventTarget.nodeName === 'A') {
        break;
      }
    }
  }

  if (!eventTarget || eventTarget.nodeName !== 'A') {
    return;
  }
  const el = /** @type {HTMLAnchorElement} */ (eventTarget);

  // Ignore if tag has
  // 1. "download" attribute
  // 2. rel="external" attribute
  if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') {
    return;
  }

  // ensure a href exists and non-hash for the same path
  const link = el.getAttribute('href');
  if (
    !link ||
    ((el.pathname === window.location.pathname || el.pathname === '') && (el.hash || link === '#'))
  ) {
    return;
  }

  // Check for mailto: in the href
  if (el.protocol && el.protocol.length > 0 && !/^https?:$/.test(el.protocol)) {
    return;
  }

  // check target
  const linkTarget = el.target ? el.target.toUpperCase() : null;
  if (linkTarget === '_BLANK') {
    targetType = LINK_TARGET_TYPE.NEW_WINDOW;
  } else if (linkTarget !== '_TOP') {
    return;
  }

  const fullUrl = new URL(link, window.location.href);
  const messageSent = postUniversalMessage(
    new ClickLink(fullUrl.toString(), targetType === LINK_TARGET_TYPE.NEW_WINDOW),
  );

  if (messageSent !== false) {
    e.preventDefault();
  }
}

export default function enableRouter() {
  document.addEventListener('click', clickEventHandler, false);
}
