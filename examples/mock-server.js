var restify = require('restify');
var server = restify.createServer({
  name: 'yak-mock',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.pre(function (req, res, next) {
  console.log("\n-- ", req.method, "---", req.url);
  console.log(req.headers);
  next();
});

var id = 2;
var users = [{ id: 1, name: "John Doe", email: "john@doe.com" }]

function getUser(id) {
  return users.find(function(user) {
    return user.id == id;
  });
}

// Create user
server.post('/users', function (req, res, next) {
  req.body.id = id;
  users.push(req.body)
  id++;
  res.send(req.body);
  return next();
});

// Get users
server.get('/users', (req, res, next) => {
  res.send(users);
  return next();
});

// Get user
server.get('/users/:id', function (req, res, next) {
  var user = getUser(req.params.id)
  if(user) { res.send(user); }
  else { res.send(404) }
  return next();
});

// Update user
server.patch('/users/:id', function (req, res, next) {
  var user = getUser(req.params.id)
  if(user) {
    Object.assign(user, req.body);
    res.send(user);
  }
  else { res.send(404) }
  return next();
});

// Destroy user
server.del('/users/:id', function (req, res, next) {
  var user = getUser(req.params.id)
  if(user) {
    deleted_user = users.splice(users.indexOf(user), 1);
    res.send(deleted_user[0]);
  }
  else {
    res.send(404)
  }
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
