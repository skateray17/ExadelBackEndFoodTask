import express from 'express';
import accountController from '../controllers/account-controller';

const router = express.Router();

router.route('/logon')
  .post((req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
      res.status(401).send({ message: 'Invalid username or password' });
    } else {
      accountController.login(req.body)
        .then(response => res.status(response.status).send(response.response))
        .catch((err) => {
          const message = JSON.parse(err.message);
          res.status(message.status).send(message.response).end();
        });
    }
  });


/**
 * Выход может быть сделан на клиентской части.
 * Потому что токен будет храниться где-то в cookie или localStorage.
 * Выход же подразумевает просто уничтожение токена.
 */
router.route('/logoff')
  .post((req, res) => {
    res.status(200).send();
  });

module.exports = router;
