import Message from './message.js';

export default class ClickLink extends Message {
  /**
   * @param {string} href
   * @param {boolean=} external
   */
  constructor(href, external = false) {
    super('click-link');
    this.data = {
      href,
      external,
    };
  }
}
