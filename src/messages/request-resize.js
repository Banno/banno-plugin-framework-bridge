import Message from './message.js';

export default class RequestResize extends Message {
  /** @param {number} height */
  constructor(height) {
    super('request-resize');
    this.data = {
      height,
    };
  }
}
