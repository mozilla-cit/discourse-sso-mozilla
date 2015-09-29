var express = require('express')
var router = express.Router()
var DiscourseSSO = require('discourse-sso')
var config = require('../config')
var sso = new DiscourseSSO(config.discourse.secret)
var models = require('../models')
var login = require('./login')
var Discourse = require('../lib/discourse')
var discourse = new Discourse(config.discourse.url, config.discourse.apikey, config.discourse.apiusername)

router.use(function (req, res, next) {
  // anytime someone loads a page from the sso server this code is executed first
  if (req.query.sso && req.query.sig) {
    // if a user has been redirected here after clicking log-in on Discourse:
    req.session.payload = req.query.sso
    req.session.sig = req.query.sig
  } if (req.session.payload && req.session.sig) {
    // if a user is currently part of the log-in flow (or just came from above), move on to the next matching bit of middleware
    next()
  } else {
    res.render('index')
  }
})

router.use('/login', login)

router.get('/', function (req, res, next) {
  var payload = req.session.payload
  var sig = req.session.sig

  if (!sso.validate(payload, sig)) return next('err')

  if (!req.session.nonce) req.session.nonce = sso.getNonce(payload)

  if (req.session.email) {
    // if the user is already logged in on the sso server
    models.User.findOne({ where: { email: req.session.email } }).then(function (user) {
      if (user) {
        res.render('welcome', { user: user })
      } else {
        // if no user exists, the user must verify their email on the sso server
        res.render('login')
      }
    })
  } else {
    // if no email is in the session store, the user must log into the sso server
    res.render('login')
  }
})

router.get('/welcome/continue', function (req, res, next) {
  models.User.findOne({ where: { email: req.session.email } }).then(function (user) {
    if (user) {
      res.locals.user = user
      next()
    } else {
      res.redirect('/')
    }
  })
})

router.get('/welcome/not-me', function (req, res) {
  req.session.email = null
  res.redirect(303, '/')
})

router.post('/register', function (req, res, next) {
  discourse.get('users/' + req.body.username, {}, function (err, reqRes, data) {
    if (err) return next(err)
    if (reqRes.statusCode === 404) {
      // the username isn't registered
      models.User.create({
        email: req.session.email
      }).then(function (user) {
        user.username = req.body.username
        user.name = req.body.name
        res.locals.user = user
        next()
      })
    } else {
      res.render('register', {
        email: req.session.email,
        username: req.body.username,
        name: req.body.name
      })
    }
  })
})

router.use(function (req, res) {
  var user = res.locals.user

  var params = {
    nonce: req.session.nonce,
    external_id: user.uuid,
    email: user.email
  }

  if (user.username) {
    params.username = user.username
    params.name = user.name
  }

  req.session.payload = null
  req.session.sig = null
  req.session.nonce = null

  res.redirect(303, 'http://discourse.local/session/sso_login?' + sso.buildLoginString(params))
})

module.exports = router
