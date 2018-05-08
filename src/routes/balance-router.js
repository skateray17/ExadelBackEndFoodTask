import express from 'express';
import balanceController from '../controllers/balance-controller';


const router = express.Router();

router.route('/')
  .get((req, res) => {
    balanceController.getBalanceList()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  })
  .post((req, res) => {
    balanceController.getUserBalance(req.body.username)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  })
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
