var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');
var request = rewire('../lib/request');
var context = new function() {
  this.attrs = { id: 5 };
  this.request = request;
}

var yaySpy = sinon.spy();
var naySpy = sinon.spy();

describe('Request', function() {
  describe('200 response', function() {
    before(function() {
      var fetchSpy = this.fetchSpy = sinon.stub();
      request.__set__({
        fetch: fetchSpy,
      });
      fetchSpy.returns(
        new Promise(function(resolve, reject) {
          resolve({
            status: 200,
            headers: {
              get: function() {
                return 'application/json';
              }
            },
            json: function() {
              return new Promise(function(resolve, reject) {
                resolve({ foo: "bar" });
              })
            },
          });
        })
      );
      return context.request('POST', 'http://lolcat.com/', {
          success: yaySpy,
          error: naySpy,
        }, {
          'random-header' : 'lol'
        }
      )
    });
    it('should return JSON', function() {
      assert(yaySpy.calledWith({ foo: 'bar'}));
    });
    it('should call fetch', function() {
      assert.deepEqual(this.fetchSpy.args[0],
        ['http://lolcat.com/', {
          method: 'POST',
          body: '{"id":5}',
          headers: {
            'Content-Type': 'application/json',
            'random-header': 'lol'
          }
        }]
      );
    });
  });
  describe('500 json response', function() {
    before(function() {
      var fetchSpy = this.fetchSpy = sinon.stub();
      request.__set__({
        fetch: fetchSpy,
      });
      fetchSpy.returns(
        new Promise(function(resolve) {
          resolve({
            status: 500,
            headers: {
              get: function() {
                return 'application/json';
              }
            },
            json: function() {
              return new Promise(function(resolve, reject) {
                resolve("lolol");
              })
            },
          });
        })
      );
      context.request('POST', 'http://lolcat.com/', {
        success: yaySpy,
        error: naySpy,
      })
    });
    it('should return json error', function() {
      assert.equal(naySpy.args[0][1], 'lolol');
      assert.equal(naySpy.args[0][2], 500);
    });
  });

  describe('500 text response', function() {
    before(function() {
      var fetchSpy = this.fetchSpy = sinon.stub();
      request.__set__({
        fetch: fetchSpy,
      });
      fetchSpy.returns(
        new Promise(function(resolve) {
          resolve({
            status: 500,
            headers: {
              get: function() {
                return 'text/plain';
              }
            },
            text: function() {
              return new Promise(function(resolve, reject) {
                resolve('troll');
              })
            },
          });
        })
      );
      context.request('POST', 'http://lolcat.com/', {
        success: yaySpy,
        error: naySpy,
      })
    });
    it('should return text error', function() {
      assert.equal(naySpy.args[1][1], 'troll');
      assert.equal(naySpy.args[1][2], 500);
    });
  });
});
