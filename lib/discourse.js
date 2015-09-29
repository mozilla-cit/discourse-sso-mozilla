var request = require('request')

var discourse = function (url, api_key, api_username) {
  this.url = url
  this.api_key = api_key
  this.api_username = api_username
}

discourse.prototype.verb = function (verb, privs, path, queries, callback) {
  if (privs) {
    queries.api_key = this.api_key
    queries.api_username = this.api_username
  }
  var q = ''
  for (var query in queries) {
    if (!q.length) {
      q += '?'
    } else {
      q += '&'
    }
    q += encodeURIComponent(query) + '=' + encodeURIComponent(queries[query])
  }
  request[verb]({
    url: this.url + path + '.json' + q,
    json: true
  }, function (err, res, data) {
    callback(err, res, data)
  })
}

discourse.prototype.get = function (path, queries, callback) {
  this.verb('get', false, path, queries, callback)
}

discourse.prototype.adminGet = function (path, queries, callback) {
  this.verb('get', true, path, queries, callback)
}

discourse.prototype.adminPut = function (path, queries, callback) {
  this.verb('put', true, path, queries, callback)
}

module.exports = discourse
