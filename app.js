var express = require('express')
var path = require('path')
// var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var models = require('./models')
var nunjucks = require('nunjucks')
var morgan = require('morgan')

var SequelizeStore = require('connect-session-sequelize')(session.Store)

var routes = require('./routes/index')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
nunjucks.configure(app.get('views'), {
  autoescape: true,
  express: app
})
app.engine('html', nunjucks.render)
app.set('view engine', 'html')

// uncomment after placing your favicon in /public
// var favicon = require('serve-favicon')app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('less-middleware')(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: process.env.SECRET || 'gaben',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: models.sequelize,
    table: 'Session'
  })
}))

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

var config = require('./config')
var Umzug = require('umzug')
var sequelize = require('./models').sequelize

var umzug = new Umzug({
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  },
  logging: console.log,
  migrations: {
    params: [
      sequelize.getQueryInterface(),
      sequelize.constructor
    ]
  }
})

app.set('port', process.env.PORT || config.server.port)

umzug.up().then(function (migrations) {
  var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port)
  })
})
