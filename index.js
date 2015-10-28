var model = require('./lib/model');

function Yak(options) {
  this.model = model;
  this.host = options.host;
}

Yak.prototype = {
  onError: function onError(fn) {
    this.errorHandler = fn;
  }
}

module.exports = Yak
