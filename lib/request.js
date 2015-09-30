var fetch = require('node-fetch');

/*
 * Wraps fetch method, returns a Promise.
 */
module.exports = function(method, endpoint, cb, headers) {
  var status;
  return new Promise((resolve, reject) => {
    fetch(endpoint, {
      method: method,
      // Stringify body if request is POST/PATCH/PUT
      body: (method[0] === "P") ? JSON.stringify(this.attrs) : null,
      headers: Object.assign(this.headers || {}, headers || {}, {
        'Content-Type': 'application/json'
      }),
    }).then(res => {
      status = res.status
      return res.json();
    }).then(json => {
      if(status === 200) {
        resolve(cb.success(json));
      } else {
        reject(cb.error(json));
      }
    });
  });
}
