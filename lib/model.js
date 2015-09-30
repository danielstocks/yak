var _ = require('lodash');
var toQueryString = require('querystring').stringify;
var request = require('./request');

function model(obj) {

  var host = this.host;
  var endpoint = host + obj.url;
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
    }, obj.headers || {});
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
    }, obj.headers || {});
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
   * DELETE /resource
   * -------------
   * Destroys resource of specified model
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
