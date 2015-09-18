![yak](https://camo.githubusercontent.com/2c76dae0fe348946211981b2d16ff2a9a9fe8444/68747470733a2f2f706978616261792e636f6d2f7374617469632f75706c6f6164732f70686f746f2f323031322f30342f32362f31342f30312f79616b2d34323534315f3634302e706e67)

# Yak

Yak is an ORM that maps RESTful resources to JavaScript models/collections.

Inspired by [Backbone.js](http://backbonejs.org/) and [Her](http://www.her-rb.org/), Yak is designed to build applications that are powered by a RESTful JSON API instead of a database. Yak uses `window.fetch` on the client, and
`node-fetch` on the server, which makes it really easy for you to write a persistence layer in an isomorphic fashion.

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
host (String) | Specify your API endpoint here

#### Example
```js
// Create new Yak instance
var yak = new Yak({
  host: "http://localhost:8080/"
});
```

### yakInstance.setHeaders

Change the HTTP headers that are being sent when a request is made in Yak.

#### Arguments
headers (Object) | Any HTTP headers that you can think of!

#### Example
```js
// On the fly HTTP header configration
yak.setHeaders({
  'Accept-Language' : 'en',
  'Authentication-Token': 'abc123'
});
```


### yakInstance.Model

Create a new model based on a Yak instance

#### Arguments
url (String) | The URL of specified model on API server

#### Example
```js
// Model defintion
var User = yak.Model({
  url: "users"
});
```

### Model (constructor)

Create a new instance of a model

#### Arguments
attrs (Object) | An object of attributes that will be asigned to the model

#### Example
```js
// Create a new user
var user = new User({
  name: "John",
  email: "john@doe.com"
});
```

### Model.get

Retrieve a model from server

#### Arguments
id (String) | An identifer that will be used to fetch the resource

#### Example
```js
// GET http://localhost:8080/users/1
var user = User.get(1).then(user => {
  console.log("Retrieved user:", user.attrs);
}).catch(error => {
  console.log(error);
});
```

### Model.all

Retrieve a collection of models from server

#### Example
```js
// GET http://localhost:8080/users
User.all().then(users => {
  users.models.forEach(user => {
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
