# Yak

Yak is an ORM that maps RESTful resources to JavaScript models/collections.

Inspired by [Backbone.js](http://backbonejs.org/) and [Her](http://www.her-rb.org/), Yak is designed to build applications that are powered by a RESTful JSON API instead of a database. Yak uses `window.fetch` on the client, and
`node-fetch` on the server, which makes it really easy for you to write a persistence layer in an isomorphic fashion.

[![Build Status](https://travis-ci.org/danielstocks/yak.png?branch=master)](https://travis-ci.org/danielstocks/yak)
[![Code Climate](https://codeclimate.com/github/danielstocks/yak.png)](https://codeclimate.com/github/danielstocks/yak)
[![Coveralls](https://img.shields.io/coveralls/danielstocks/yak/master.svg)](https://coveralls.io/github/danielstocks/yak?branch=master)


## Installation & Requirements

Yak requires Node.js >= 4.0. To run in a web browser environment you'll need native or polyfilled support for
ES6 Promises, Object.assign, Fat Arrow Syntax, and the window.fetch API.

Run `npm install yak-orm` and then require it in your project:

```js
var Yak = require('yak-orm');
var yak = new Yak({
  host: "http://localhost:8080/"
});
```

You should now be ready to go!


## Yak is a work in progress

Features that are on the roadmap but *not yet* currently implemented include:

- Events
- Nested models
- Validations
- Caching
- Suggestions...?

## API Documentation

### Yak (constructor)

Create a new Yak instance

#### Arguments
- host (String) | Specify your API endpoint here

#### Example
```js
// Create new Yak instance
var yak = new Yak({
  host: "http://localhost:8080/"
});
```

### yakInstance.model

Create a new model based on a Yak instance

#### Arguments
- url (String) | The URL of specified model on API server

#### Example
```js
// Model defintion
var User = yak.model({
  url: "users"
});
```

### Model (constructor)

Create a new instance of a model

#### Arguments
- attrs (Object) | An object of attributes that will be assigned to the model
- headers (Object) | Specify HTTP headers to be sent along with any model requests

#### Example
```js
// Create a new user
var user = new User({
  attrs: {
    name: "John",
    email: "john@doe.com"
  },
  headers: {
    'Accept-Language' : 'en',
    'Authentication-Token': 'abc123'
  }
});
```

### Model.get

Retrieve a model from server

#### Arguments
- id (String) | An identifier that will be used to fetch the resource
- where (Object) | Additional query parameters to be sent in request
- headers (Object) | Specify HTTP headers to be sent along with the request

#### Example
```js
// GET http://localhost:8080/users/1?active=true
var user = User.get({
  id: 5,
  where: {
    active: true
  }
  headers: {
    'Accept-Language' : 'fa',
  }
}).then(user => {
  console.log("Retrieved user:", user.attrs);
}).catch(error => {
  console.log(error);
});
```

### Model.all

Retrieve a collection of models from server

#### Arguments
- where (Object) | Additional query parameters to be sent in request
- headers (Object) | Specify HTTP headers to be sent along with the request

#### Example
```js
// GET http://localhost:8080/users
User.all().then(users => {
  users.forEach(user => {
    console.log(user.attrs.id, user.attrs.name);
  });
});
```

### modelInstance.save

Persist a model to server

If an id attribute is present a `PATCH` operation
will be performed to update an existing record

Otherwise a `POST` operation will be sent
to create the record on the endpoint.

#### Example
```js
// POST http://localhost:8080/users
var user = new User({ name: "Daniel" });
user.save().then(user => {
  // Update user name
  user.attrs.name = "Yak Yak"
  // PATCH http://localhost:8080/users/(user.attrs.id)
  return user.save()
}).catch(error => {
  console.log(error);
});
```


### modelInstance.destroy

Remove a model from server

#### Example
```js
var user = new User({ id: "5" });
// DELETE http://localhost:8080/users/5
user.destroy().then(user => {
  console.log("Deleted user:", user.attrs.id);
}).catch(error => {
  console.log(error);
});
```
