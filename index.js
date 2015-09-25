var model = require('./lib/model');

module.exports = function(options) {
  this.model = model;
  this.headers = {
    'Content-Type': 'application/json'
  }
  this.host = options.host;
}
