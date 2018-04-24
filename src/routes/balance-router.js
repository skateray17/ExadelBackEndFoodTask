import express from 'express';
import balanceController from '../controllers/balance-controller';


const router = express.Router();

router.route('/getBalanceList')
  .get((req, res) => {
    balanceController.getBalanceList()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
router.route('/updateUserBalance')
  .post((req, res) => {
    balanceController.updateUserBalance(req.body.username, req.body.balance)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });


module.exports = router;
