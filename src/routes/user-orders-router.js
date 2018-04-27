import express from 'express';
import ordersController from '../controllers/user-orders-controller';
import User from '../models/User';

const router = express.Router();

router.route('/getUserOrders')
  .get((req, res) => {
    User.findById({ _id: req.parsedToken.id })
      .then(user => ordersController.getOrders(user.email))
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });

router.route('/addOrder')
  .put((req, res) => {

  });
module.exports = router;
