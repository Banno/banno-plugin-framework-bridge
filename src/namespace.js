/* eslint-disable dot-notation, no-multi-assign */

import {
  requestClose,
  requestSync,
  postUniversalMessage,
  ping,
  ready,
  requestResize,
  host,
  HOST_EVENTS,
  enableRouter,
} from './index.js';

ext['requestClose'] = requestClose;
ext['requestSync'] = requestSync;
ext['postUniversalMessage'] = postUniversalMessage;
ext['ping'] = ping;
ext['ready'] = ready;
ext['requestResize'] = requestResize;
ext['host'] = host;
ext['HOST_EVENTS'] = HOST_EVENTS;
ext['enableRouter'] = enableRouter;
