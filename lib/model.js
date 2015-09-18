var _ = require('lodash');
var fetch = require('node-fetch');

function Model(obj) {
  var headers = this.headers;
  var host = this.host;
  var endpoint = host + obj.url;

  /*
   * Wraps fetch method, returns a Promise.
   */
  var request = function(method, endpoint, cb) {
    return new Promise((resolve, reject) => {
      fetch(endpoint, {
        method: method,
        headers: headers,
        body: (method == "POST" || method == "PATCH") ? JSON.stringify(this.attrs) : null
      }).then(res => {
        return res.json();
      }).then(json => {
        resolve(cb.success(json));
      }).catch(error => {
        reject(cb.error(error));
      });
    });
  }

  var fn = function(attrs) {
    _.extend(this, {
      errors : {},
      headers: headers,
      host: host,
      attrs: _.cloneDeep(attrs),
      url: obj.url,
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
   * Returns a collection of models of specified resource
   */
  fn.all = function() {
    return request('GET', endpoint, {
      success: function(json) {
        var collection = {};
        collection.models = json.map(item => {
          return new fn(item);
        });
        return collection;
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
  fn.get = function(id) {
    return request('GET', endpoint + '/' + id, {
      success: function(json) {
        return new fn(json);
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
    return this.request('GET', this.endpoint + '/' + this.attrs.id, {
      success: json => {
        return this
      },
      error: error => {
        return error;
      }
    });
  }
};

module.exports = Model;
