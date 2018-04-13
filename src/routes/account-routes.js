import express from 'express';
import accountController from '../controllers/account-controller';

const router = express.Router();

router.route('/logon')
  .post((req, res) => {
    if (!req.body.email || !req.body.password) {
      res.send(401).send({ token: null, auth: false, message: 'Wrong data!' });
    } else {
      accountController.logon(req.body, (status, resp) => res.status(status).send(resp));
    }
  });


/**
 * Выход может быть сделан на клиентской части.
 * Потому что токен будет храниться где-то в cookie или localStorage.
 * Выход же подразумевает просто уничтожение токена.
 */
router.route('/logoff')
  .post((req, res) => {
    res.status(200).send({ auth: false, token: null });
  });

module.exports = router;
