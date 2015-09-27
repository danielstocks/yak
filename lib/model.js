var _ = require('lodash');
var fetch = require('node-fetch');
var toQueryString = require('querystring').stringify;

function model(obj) {
  var host = this.host;
  var endpoint = host + obj.url;

  /*
   * Wraps fetch method, returns a Promise.
   */
  var request = function(method, endpoint, cb) {
    var headers = this.headers;
    var body = ['POST', 'PUT', 'PATCH'].indexOf(method) > -1 ? JSON.stringify(this.attrs) : null;
    // Temporary work around until https://github.com/bitinn/node-fetch/issues/47
    // is resolved
    if(body) {
      headers['content-length'] == Buffer.byteLength(body);
    }
    return new Promise((resolve, reject) => {
      fetch(endpoint, {
        method: method,
        headers: headers,
        body: body
      }).then(res => {
        return res.json();
      }).then(json => {
        resolve(cb.success(json));
      }).catch(error => {
        reject(cb.error(error));
      });
    });
  }

  var fn = function(obj) {
    _.extend(this, {
      host: host,
      attrs: _.cloneDeep(obj.attrs) || {},
      url: obj.url,
      headers: obj.headers || {},
      endpoint: endpoint,
      request: request,
    });
    // Todo: Improve this, and allow for static methods
    // to be added
    this.__proto__ = _.extend(obj, _.cloneDeep(methods));
  };

  /*
   * GET /resource
   * -------------
   * Returns an Array of models of specified resource
   */
  fn.all = function(obj) {
    var qs = 'where' in obj ? '?' + toQueryString(obj.where) : '';
    return request('GET', endpoint + qs, {
      success: function(json) {
        return json.map(attrs => {
          return new fn({ attrs: attrs });
        });
      },
      error: function(error) {
        return error;
      }
    });
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
        return new fn({ attrs: json });
      },
      error: function(error) {
        return error;
      }
    });
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
        error: error => {
          return error;
        }
      });
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
        error: error => {
          return error;
        }
      });
    }
  },

  /*
   * PATCH /resource
   * -------------
   * Updates resource of specified model
   */
  destroy: function() {
    return this.request('DELETE', this.endpoint + '/' + this.attrs.id, {
      success: json => {
        return this
      },
      error: error => {
        return error;
      }
    });
  }
};

module.exports = model;
