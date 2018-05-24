import express from 'express';
import balanceController from '../controllers/balance-controller';
import authorization from '../controllers/authorization';
import accountController from '../controllers/account-controller';

const router = express.Router();

router.route('/')
  .get((req, res, next) => {
    if (!('name' in req.query)) {
      accountController.getUsername(req)
        .then(username => balanceController.findUserByUsername(username))
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else {
      authorization.authorizeAdmin(req, res, next);
    }
  })
  .get((req, res) => {
    balanceController.findUsers(
      req.query.name,
      Number.parseInt(req.query.page, 10),
      Number.parseInt(req.query.perPage, 10),
    )
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  })
  .put(authorization.authorizeAdmin)
  .put((req, res) => {
    balanceController.updateUserBalance(req.body.username, req.body.balance)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });


module.exports = router;
