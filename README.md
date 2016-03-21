<img src="http://i.imgur.com/vaZYkAV.png" alt="Yak" align="left">


[![Build Status](https://travis-ci.org/danielstocks/yak.png?branch=master)](https://travis-ci.org/danielstocks/yak)
[![Code Climate](https://codeclimate.com/github/danielstocks/yak.png)](https://codeclimate.com/github/danielstocks/yak)
[![Coveralls](https://img.shields.io/coveralls/danielstocks/yak/master.svg)](https://coveralls.io/github/danielstocks/yak?branch=master)

Yak is an ORM that maps RESTful resources to JavaScript models/collections.


Inspired by [Backbone.js](http://backbonejs.org/) and [Her](http://www.her-rb.org/), Yak is designed to build applications that are powered by a RESTful JSON API instead of a database. Yak uses `window.fetch` on the client, and
`node-fetch` on the server, which makes it really easy for you to write a persistence layer in an isomorphic fashion.

Yak is designed to be extremely lightweight, weighing in at **less than 1kb**. It's only dependency is the [window.fetch API](https://developers.google.com/web/updates/2015/03/introduction-to-fetch) which is gaining [native support](http://caniuse.com/#search=fetch) in most browsers as of writing.


## Installation & Requirements

Run `npm install yak-orm` and then simply require it in your project.

Yak requires Node.js >= 4.0 to run on the server.

To run in a web browser environment you'll need native or polyfilled support for
ES6 Promises, Object.assign, Fat Arrow Syntax, and the window.fetch API. It's also
recommended that you use Webpack or Browserify to make your build.


## Elevator pitch

```js
var Yak = require('yak-orm');
var yak = new Yak({
  host: "http://localhost:8080/"
});

var Fruit = yak.model({
  name: "fruits"
});

// GET http://localhost:8000/fruits?color=red
// returns { fruits: [{ name: "apple", name: "pomegranate"}] }
Fruit.all({
  where: {
    color: 'red'
  }
}).then(collection => {
  collection.fruits.forEach(fruit => {
    console.log(fruit.attrs.name);
  });
});
```


### Yak is a work in progress

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
- name (String) | The name of the resource specified on API server
- url (String, optional) | Resource URI is generated based on name but can be overridden by passing this argument
- parse (Function(attrs (Object) ), optional) | This method will be called every time a new instance of the model is created. It will receive the model attributes as an argument, allowing you to mutate them before model is created.

#### Example
```js
// Model defintion
var User = yak.model({
  name: "users",
  parse: function(attrs) {
    attrs.fullName = attrs.firstName + " " + attrs.lastName;
    return attrs;
  }
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
User.all().then(collection => {
  collection.users.forEach(user => {
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


### Testing

Run tests:
`npm test`

Run tests with code coverage:
`istanbul cover _mocha`
