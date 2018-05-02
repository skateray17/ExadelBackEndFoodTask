import express from 'express';
import ordersController from '../controllers/user-orders-controller';
import User from '../models/User';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    User.findById({ _id: req.parsedToken.id })  
      .then(user => ordersController.getOrders(user.email, req.body.startDate, req.body.endDate))
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });

router.route('/')
  .put((req, res) => {
    User.findById({ _id: req.parsedToken.id })
      .then((user) => { req.body.username = user.email; ordersController.addOrder(req.body); })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });
module.exports = router;
