var model = require('./lib/model');

module.exports = function(options) {
  this.model = model;
  this.host = options.host;
}
