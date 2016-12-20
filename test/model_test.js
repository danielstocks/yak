var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');
var model = rewire('../lib/model');
var context = new function() {
  this.host = "http://localhost/"
  this.model = model;
}
var fun = function() { return "funfunfun"}
var TestModel = context.model({
  name: "fruits",
  fun: fun,
  parse: function(attrs) {
    attrs.test = "test";
    return attrs
  }
});

var TestModel2 = context.model({
  name: "items",
  url: "bears"
});


describe('Model instance', function() {
  it('should inherit methods', function() {
    this.model = new TestModel({
      attrs: { foo: 'bar' },
      headers: { hello: 'friend' }
    });
    assert.equal(this.model.fun, fun);
    assert.equal(this.model.fun(), "funfunfun");
  });
  it('should allow empty attrs', function() {
    var model = new TestModel2();
    assert.deepEqual(model.attrs, {});
  });
  describe('save new', function() {
    before(function() {
      var requestSpy = this.requestSpy = sinon.stub();
      model.__set__({
        request: requestSpy,
      });
      this.model = new TestModel({
        attrs: { foo: 'bar' },
        headers: { hello: 'friend' }
      });
    });
    describe('success', function() {
      before(function() {
        this.requestSpy.withArgs('POST', 'http://localhost/fruits').returns(
          new Promise(function(resolve, reject) {
            resolve();
          })
        );
        this.yaySpy = sinon.spy();
        this.model.save().then(model => {
          this.yaySpy();
        })
      });
      it('should use POST method', function () {
        assert.equal(this.requestSpy.args[0][0], 'POST')
      });
      it('should call the correct endpoint', function() {
        assert.equal(this.requestSpy.args[0][1], 'http://localhost/fruits');
      });
      it('should call with correct headers', function() {
        assert.deepEqual(this.requestSpy.args[0][3], { hello: 'friend' });
      });
      it('set returned attrs on model', function() {
        this.requestSpy.args[0][2].success({ high: 'five' });
        assert.deepEqual(this.model.attrs, { high: 'five' });
      });
      it('should call success callback', function () {
        assert(this.yaySpy.calledOnce);
      });
    });
    describe('fail', function() {
      before(function() {
        this.requestSpy.withArgs('POST', 'http://localhost/fruits').returns(
          new Promise(function(resolve, reject) {
            reject("hello");
          })
        );
        this.naySpy = sinon.spy();
        this.model.save().then().catch(error => {
          this.naySpy(error);
        })
      });
      it('should return error in callback', function () {
        assert(this.naySpy.calledWith('hello'));
      });
      it('should reject', function () {
        assert(this.naySpy.calledOnce);
      });
    });
    describe('error handler', function() {
      it('should reject', function() {
        var rejectSpy = sinon.spy();
        this.model.errorHandler(rejectSpy, 'lol');
        assert(rejectSpy.calledWith('lol'));
      });
    });
  });

  describe('save existing', function() {
    before(function() {
      var requestSpy = this.requestSpy = sinon.stub();
      model.__set__({
        request: requestSpy,
      });
      this.existing = new TestModel({
        attrs: { foo: 'bar', id: 5 },
        headers: { hello: 'friend' }
      });
    });
    describe('success', function() {
      before(function() {
        this.requestSpy.withArgs('PATCH', 'http://localhost/fruits/5').returns(
          new Promise(function(resolve, reject) {
            resolve();
          })
        );
        this.yaySpy = sinon.spy();
        this.existing.save().then(model => {
          this.yaySpy();
        })
      });
      it('should use PATCH method', function () {
        assert.equal(this.requestSpy.args[0][0], 'PATCH')
      });
      it('set returned attrs on model', function() {
        this.requestSpy.args[0][2].success({ id: 5, high: 'five' });
        assert.deepEqual(this.existing.attrs, { id: 5, high: 'five' });
      });
      it('should call with correct headers', function() {
        assert.deepEqual(this.requestSpy.args[0][3], { hello: 'friend' });
      });
      it('should call the correct endpoint', function() {
        assert.equal(this.requestSpy.args[0][1], 'http://localhost/fruits/5');
      });
      it('should call success callback', function () {
        assert(this.yaySpy.calledOnce);
      });
    });
    describe('fail', function() {
      before(function() {
        this.requestSpy.withArgs('PATCH', 'http://localhost/fruits/5').returns(
          new Promise(function(resolve, reject) {
            reject('boo');
          })
        );
        this.naySpy = sinon.spy();
        this.existing.save().then().catch(error => {
          this.naySpy(error);
        })
      });
      it('should return error in callback', function () {
        assert(this.naySpy.calledWith('boo'));
      });
      it('should reject', function () {
        assert(this.naySpy.calledOnce);
      });
    });
  });

  describe('destroy existing', function() {
    before(function() {
      var requestSpy = this.requestSpy = sinon.stub();
      model.__set__({
        request: requestSpy,
      });
      this.existing = new TestModel({
        attrs: { foo: "bar", id: 5 }
      });
    });

    describe('success', function() {
      before(function() {
        this.requestSpy.withArgs('DELETE', 'http://localhost/fruits/5').returns(
          new Promise(function(resolve, reject) {
            resolve();
          })
        );
        this.yaySpy = sinon.spy();
        this.existing.destroy().then(model => {
          this.yaySpy();
        })
      });
      it('should use DELETE method', function () {
        assert.equal(this.requestSpy.args[0][0], 'DELETE')
      });
      it('success callback returns model', function() {
        var model = this.requestSpy.args[0][2].success();
        assert.equal(this.existing, model);
      });
      it('should call the correct endpoint', function() {
        assert.equal(this.requestSpy.args[0][1], 'http://localhost/fruits/5');
      });
      it('should call success callback', function () {
        assert(this.yaySpy.calledOnce);
      });
    });

    describe('fail', function() {
      before(function() {
        this.requestSpy.withArgs('DELETE', 'http://localhost/fruits/5').returns(
          new Promise(function(resolve, reject) {
            reject('foo');
          })
        );
        this.naySpy = sinon.spy();
        this.existing.destroy().then().catch(error => {
          this.naySpy(error);
        })
      });
      it('should return error in callback', function () {
        assert(this.naySpy.calledWith('foo'));
      });
      it('should reject', function () {
        assert(this.naySpy.calledOnce);
      });
    });
  });
});


describe('Model', function() {
  describe('get', function () {
    before(function() {
      var requestSpy = this.requestSpy = sinon.stub();
      requestSpy.withArgs('GET', 'http://localhost/fruits/5?foo=bar&bar=foo').returns(
        new Promise(function(resolve, reject) {
          resolve({ id: 5 });
        })
      );
      requestSpy.withArgs('GET', 'http://localhost/fruits?foo=bar&bar=foo').returns(
        new Promise(function(resolve, reject) {
          resolve({});
        })
      );
      requestSpy.withArgs('GET', 'http://localhost/fruits/10').returns(
        new Promise(function(resolve, reject) {
          reject('bar');
        })
      );
      model.__set__({
        request: requestSpy,
      });
    });
    describe('success', function() {
      before(function() {
        this.yaySpy = sinon.spy();
        TestModel.get({
          id: 5,
          where: {
            foo: 'bar',
            bar: 'foo'
          },
          headers: {
            test: 'test-header'
          }
        }).then(() => {
          this.yaySpy();
        });
      });
      it('should use GET method', function () {
        assert.equal(this.requestSpy.args[0][0], 'GET')
      });
      it('should call the correct endpoint', function() {
        assert.equal(this.requestSpy.args[0][1], 'http://localhost/fruits/5?foo=bar&bar=foo');
      });
      it('should return new instance of model', function() {
        var model = this.requestSpy.args[0][2].success({ id: 5 });
        assert.deepEqual(model.attrs, { id: 5, test: 'test' });
      });
      it('should set headers', function() {
        var model = this.requestSpy.args[0][2].success({ id: 5 });
        assert.deepEqual(model.headers, { test: 'test-header' });
      });
      it('should call success callback', function () {
        assert(this.yaySpy.calledOnce);
      });
      it('should get model without id', function () {
        TestModel.get({
          where: {
            foo: 'bar',
            bar: 'foo'
          }
        })
        assert.equal(this.requestSpy.args[1][1], 'http://localhost/fruits?foo=bar&bar=foo');
      });
      it('should work with no arguments', function () {
        TestModel.get()
        assert.equal(this.requestSpy.args[2][1], 'http://localhost/fruits');
      });
    });
    describe('fail', function() {
      before(function() {
        this.naySpy = sinon.spy();
        TestModel.get({id: 10}).then().catch(error => {
          this.naySpy(error)
        });
      });
      it('should return error in callback', function () {
        assert(this.naySpy.calledWith('bar'));
      });
      it('should call error callback on fail', function () {
        assert(this.naySpy.calledOnce);
      });
    });
  });

  describe('all', function () {
    before(function() {
      var requestSpy = this.requestSpy = sinon.stub();
      requestSpy.withArgs('GET', 'http://localhost/fruits?foo=bar&bar=foo').returns(
        new Promise(function(resolve, reject) {
          resolve();
        })
      );
      requestSpy.withArgs('GET', 'http://localhost/bears').returns(
        new Promise(function(resolve, reject) {
          resolve();
        })
      );
      requestSpy.withArgs('GET', 'http://localhost/fruits?fail=me').returns(
        new Promise(function(resolve, reject) {
          reject('ha');
        })
      );
      model.__set__({
        request: requestSpy,
      });
    });
    describe('success', function() {
      before(function() {
        this.yaySpy = sinon.spy();
        TestModel.all({
          where: {
            foo: 'bar',
            bar: 'foo'
          },
          headers: {
            test: 'test-header'
          }
        }).then(testModel => {
          this.yaySpy(testModel);
        });
      });
      it('should use GET method', function () {
        assert.equal(this.requestSpy.args[0][0], 'GET')
      });
      it('should return a collection of models', function () {
        var collection = this.requestSpy.args[0][2].success({ fruits: [{ id: 5 }]});
        assert.deepEqual(collection.fruits[0].attrs, { id: 5, test: "test" });
      });
      it('should set headers for each model in collection', function () {
        var collection = this.requestSpy.args[0][2].success({ fruits: [{ id: 5 }]});
        assert.deepEqual(collection.fruits[0].headers, { test: 'test-header' });
      });
      it('should call the correct endpoint', function() {
        assert.equal(this.requestSpy.args[0][1], 'http://localhost/fruits?foo=bar&bar=foo');
      });
      it('should call success callback on success', function () {
        assert(this.yaySpy.calledOnce);
      });
      describe('without args and model without a name', function() {
        before(function() {
          this.yaySpy2 = sinon.spy();
          TestModel2.all().then(bears => {
            this.yaySpy2(bears);
          });
        });
        it('should call success callback on success', function () {
          assert(this.yaySpy2.calledOnce);
        });
        it('should return a collection of models', function () {
          var collection = this.requestSpy.args[1][2].success({ items: [{ id: 5 }]});
          assert.deepEqual(collection.items[0].attrs, { id: 5 });
        });
      });
    });
    describe('fail', function() {
      before(function() {
        this.naySpy = sinon.spy();
        TestModel.all({where: { fail: "me" }}).then().catch(error => {
          this.naySpy(error)
        });
      });
      it('should return error in callback', function () {
        assert(this.naySpy.calledWith('ha'));
      });
      it('should call error callback on fail', function () {
        assert(this.naySpy.calledOnce);
      });
    });
  });
});
