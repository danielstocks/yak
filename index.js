var Model = require('./lib/model');

module.exports = function(options) {

  Model.yak = this;
  this.Model = Model;
  this.headers = {
    'Content-Type': 'application/json'
  }
  this.host = options.host;

  this.setHeaders = function(options) {
    Object.assign(this.headers, options);
  }
}
