import express from 'express';
import balanceController from '../controllers/balance-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
  .get(authorization.authorizeAdmin)
  .get((req, res) => {
    balanceController.findUsers(req.query.name, Number.parseInt(req.query.page, 10))
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
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });


module.exports = router;
