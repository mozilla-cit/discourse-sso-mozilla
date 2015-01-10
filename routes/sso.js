var express = require('express');
var router = express.Router();
var discourse_sso = require('discourse-sso');
var sso = new discourse_sso(process.env.SECRET || 'gaben');
var request = require('request');
var url = require('url');

router.get('/', function(req, res) {
  var ref = req.session.ref = url.parse(req.get('Referrer'));
  var payload = req.query.sso;
  var sig = req.query.sig;
  
  if(sso.validate(payload, sig)) {
    req.session.nonce = sso.getNonce(payload);
    res.render('sso', { ref: ref.hostname });
  } else {
    res.redirect(ref.href);
  }
});

router.get('/persona', function(req, res) {
  request.post({
    url: 'https://verifier.login.persona.org/verify',
    json: {
      assertion: req.query.ass,
      audience: req.protocol + '://' + req.get('Host')
    }
  }, function(e, r, body) {
    if(body && body.email) {
      var userparams = {
        nonce: req.session.nonce,
        external_id: 'persona:'+body.email,
        email: body.email
      }
      res.redirect(req.session.ref.protocol + '//' + req.session.ref.host + '/session/sso_login?' + sso.buildLoginString(userparams));
    }
  });
});

module.exports = router;
