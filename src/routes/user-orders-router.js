import express from 'express';
import ordersController from '../controllers/user-orders-controller';

const router = express.Router();

router.route('/getUserOrders')
  .get((req, res) => {
    ordersController.getOrders(req.query.username)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });

router.route('/addOrder')
  .put((req, res) => {

  });
module.exports = router;
