import express from 'express';
import Employee from '../models/Employee';
import accountController from '../controllers/account-controller';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    accountController.getLoginStatus(req, res)
      .then((response) => {
        if (response.data.loginStatus === 'loggedIn') {
          if (response.data.permissions.includes('efds_admin')) { return { login: response.data.login, type: 10 }; }
          return { login: response.data.login, type: 1 };
        }
        return new Error('Relogin is needed');
      })
      .then(userInfo => Employee.findOne({ email: userInfo.login }).then((user) => {
        if (!user) return Promise.reject();
        const {
          firstName, lastName, id, email,
        } = user;
        const tmp = {
          firstName, lastName, id, email, type: userInfo.type,
        };
        return res.send(tmp);
      }))
      .catch(err => res.status(500).send(err));
  });

module.exports = router;
