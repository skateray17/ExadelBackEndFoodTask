import express from 'express';
import axios from 'axios/index';
import passport from 'passport/lib/index';
import Employee from '../models/Employee';
import ExternalLinks from '../models/extrnal-links';
import AccountController from '../controllers/account-controller';

const LocalStrategy = require('passport-local').Strategy;


const router = express.Router();
passport.use(new LocalStrategy((username, password, done) => {
  Employee.findOne({ username }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, null, { username, password });
    }
    return done(null, true, { username, password });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


router.post('/login', (req, res) => {
  passport.authenticate('local', (autError, employee, userCredential) => {
    if (autError) {
      return res.status(500).send(autError.message);
    }
    if (!employee) {
      return AccountController.firstLogin(req, res, userCredential);
    }
    return AccountController.login(req, res, userCredential);
  })(req, res);
});

router.get('/logout', (req, res) => axios(`${ExternalLinks.rvisionLink}/security/logout`, {
  headers: { cookie: req.headers.cookie },
  method: 'GET',
}).then((response) => {
  if (response.data.success) {
    return res.status(200).end();
  }
  return res.status(401).end();
}).catch(() => res.status(500).end()));
module.exports = router;

