export default class Message {
  /** @param {string} type */
  constructor(type) {
    /** @type {string} */
    this.type = type;
    /** @type {Object} */
    this.data = {};
  }
}
