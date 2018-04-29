import express from 'express';
import ordersController from '../controllers/user-orders-controller';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    ordersController.getOrders(req.query.username, req.query.startDate, req.query.endDate)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });

router.route('/')
  .put((req, res) => {
    ordersController.addOrder(req.body).then((response) => {
      res.status(200).send(response);
    })
      .catch((err) => { res.status(500).send(err); });
  });
module.exports = router;
