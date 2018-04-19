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
router.route('/changeBalanceList')
  .post((req, res) => {
    balanceController.changeUserBalance(req.body.email, req.body.balance)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });


module.exports = router;
