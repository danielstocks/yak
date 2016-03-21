var toQueryString = require('querystring').stringify;
var request = require('./request');

function model(options) {
  var self = this;
  var host = this.host;
  var endpoint = host + (options.url || options.name);
  var name = options.name;
  this.errorHandler = function(reject, error, status) {
    return reject(error);
  }
  var fn = function(obj) {
    obj = obj || {}
    var attrs = options.parse ? options.parse(obj.attrs) : obj.attrs;
    this.errorHandler = self.errorHandler;
    Object.assign(this, {
      host: host,
      attrs: Object.assign({}, attrs),
      headers: obj.headers || {},
      endpoint: endpoint,
      request: request,
    });
    // Todo: Improve this, and allow for static methods
    // to be added
    this.__proto__ = Object.assign(options, Object.assign({}, methods));
  };

  /*
   * GET /resource
   * -------------
   * Returns an Array of models of specified resource
   */
  fn.all = function(obj) {
    obj = obj || {}
    var qs = 'where' in obj ? '?' + toQueryString(obj.where) : '';
    return request('GET', endpoint + qs, {
      success: function(json) {
        json[name] = json[name].map(attrs => {
          return new fn({
            attrs: attrs,
            headers: obj.headers || null
          });
        });
        return json;
      },
      error: self.errorHandler
    }, obj.headers);
  }

  /*
   * GET /resource/:id
   * -------------
   * Returns a single models of specified resource
   */
  fn.get = function(obj) {
    var qs = 'where' in obj ? '?' + toQueryString(obj.where) : '';
    return request('GET', endpoint + '/' + obj.id + qs, {
      success: function(json) {
        return new fn({
          attrs: json,
          headers: obj.headers || null
        });
      },
      error: self.errorHandler
    }, obj.headers);
  }
  return fn;
}

// Instance Methods
var methods = {

  /*
   * Will either create or update a resource
   * depending if model has id attribute set
   */
  save: function() {
    if(!this.attrs.id) {
      /*
       * POST /resource
       * -------------
       * Creates a new resource of specified model
       */
      return this.request('POST', this.endpoint, {
        success: json => {
          this.attrs = json;
          return this;
        },
        error: this.errorHandler
      }, this.headers);
    } else {
      /*
       * PATCH /resource
       * -------------
       * Updates resource of specified model
       */
      return this.request('PATCH', this.endpoint + '/' + this.attrs.id, {
        success: json => {
          this.attrs = json;
          return this;
        },
        error: this.errorHandler
      }, this.headers);
    }
  },

  /*
   * DELETE /resource
   * -------------
   * Destroys resource of specified model
   */
  destroy: function() {
    return this.request('DELETE', this.endpoint + '/' + this.attrs.id, {
      success: json => {
        return this
      },
      error: this.errorHandler
    });
  }
};

module.exports = model;
