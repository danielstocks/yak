var Yak = require('../index.js');

// Create new Yak instance
var yak = new Yak({
  host: "http://localhost:8080/"
})

// Model defintion
var User = yak.model({
  url: "users"
});

// Get existing user
var user = User.get({
  id: 1,
  headers: {
    'Accept-Language' : 'fa',
  }
}).then(user => {
  console.log("Retrieved user:", user.attrs);
}).catch(error => {
  console.log(error);
});

// Create a new user
var user = new User({
  attrs: {
    name: "Daniel",
    email: "daniel@webcloud.se"
  },
  headers: {
    'Authentication-Token': 'abc123'
  }
});

// Persist to server
user.save().then(user => {
  // Update user name
  user.attrs.name = "Yak Yak"
  console.log("User id:", user.attrs.id, "created");
  return user.save()
}).then(user => {
  console.log("User id:", user.attrs.id, "updated");
}).catch(error => {
  console.log(error);
});


// Create invalid user
var invalidUser = new User({
  attrs: {
    email: "invalid@webcloud.se"
  }
});

invalidUser.save().then(user => {
  console.log("this should not log");
}).catch(error => {
  console.log("Could not save user:", error);
});


// Get all users
User.all({
  where: {
    active : true
  }
}).then(users => {
  console.log("Fetching all users:");
  users.forEach(user => {
    console.log("\t", user.attrs.id, user.attrs.name);
  });
  // Delete the first user
  return users[1].destroy();
}).then(user => {
  console.log("User id:", user.attrs.id, "deleted");
}).catch(error => {
  console.log(error);
});
