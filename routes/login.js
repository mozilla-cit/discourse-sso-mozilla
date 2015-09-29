var express = require('express')
var router = express.Router()
var config = require('../config')
var request = require('request')
var models = require('../models')
var Discourse = require('../lib/discourse')
var discourse = new Discourse(config.discourse.url, config.discourse.apikey, config.discourse.apiusername)

router.post('/persona', function (req, res, next) {
  request.post({
    url: 'https://verifier.login.persona.org/verify',
    json: {
      assertion: req.body.assertion,
      audience: config.origin
    }
  }, function (err, reqRes, body) {
    if (err) return next(err)
    req.session.email = body.email
    next()
  })
})

router.use(function (req, res, next) {
  models.User.findOne({ where: { email: req.session.email } }).then(function (user) {
    if (user) {
      // if the user is already registered, chuck back to the middleware at the end of index.js
      res.locals.user = user
      next()
    } else {
      discourse.adminGet('admin/users/list/all', { filter: req.session.email }, function (err, reqRes, discourseUsers) {
        if (err) return next(err)

        checkEmail(0)

        function checkEmail (i) {
          // oh jeeze...
          // discourse doesn't offer a way to get a user based on an email,
          // so we have to filter from the list of all users,
          // however this includes substring matches, hence:
          if (discourseUsers.length === i) {
            // we've run out of emails to iterate over from discourse,
            // so the account isn't registered on discourse
            res.render('register', { email: req.session.email })
          } else {
            var username = discourseUsers[i].username
            discourse.adminPut('users/' + username + '/emails', {}, function (err, reqRes, emails) {
              if (err) return next(err)
              var email = emails.email
              if (email === req.session.email) {
                // wahey! we've found the email on discourse,
                // so we just need to migrate
                migrate()
              } else {
                i++
                checkEmail(i)
              }
            })
          }
        }

        function migrate () {
          models.User.create({
            email: req.session.email
          }).then(function (user) {
            res.locals.user = user
            next()
          })
        }
      })
    }
  })
})

module.exports = router
