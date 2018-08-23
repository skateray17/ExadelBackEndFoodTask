import express from 'express';
import axios from 'axios';
import Employee from '../models/Employee';
import ExternalLinks from '../models/extrnal-links';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
      headers: { cookie: req.headers.cookie },
      method: 'GET',
    })
      .then((response) => {
        if (response.data.loginStatus === 'loggedIn') {
          if (response.data.permissions.includes('efds_admin')) { return { login: response.data.login, type: 10 }; }
          return { login: response.data.login, type: 1 };
        }
        return new Error('Relogin is needed');
      })
      .then(userInfo => Employee.findOne({ username: userInfo.login }).then((user) => {
        if (!user) return Promise.reject();
        user.type = userInfo.type;
        return res.send(user);
      }))
      .catch(err => res.status(500).send(err));
  });

module.exports = router;
