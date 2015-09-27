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
var user = User.get({id: 1}).then(user => {
  console.log("Retrieved user:", user.attrs);
}).catch(error => {
  console.log(error);
});

// Create a new user
var user = new User({
  attrs: {
    name: "Daniel",
    email: "daniel@webcloud.se"
  }
});

// Persist to server
user.save().then(user => {
  // Update user name
  user.attrs.name = "Yak Yak"
  return user.save()
}).catch(error => {
  console.log(error);
});

// Get all users
User.all({
    where: {
      active : true
    }
  }).then(users => {
  users.forEach(user => {
    console.log(user.attrs.id, user.attrs.name);
  });
  // Delete the first user
  return users[0].destroy();
}).then(user => {
  console.log("Deleted user:", user.attrs.id);
});
