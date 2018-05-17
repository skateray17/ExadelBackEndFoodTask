import express from 'express';
import ordersController from '../controllers/user-orders-controller';
import User from '../models/User';
import userTypes from '../models/user-types';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    if (req.query.currentDate === undefined) {
      User.findById({ _id: req.parsedToken.id })
        .then((user) => {
          let startDate;
          let endDate;
          if (typeof req.query.startDate === 'string') {
            startDate = new Date(req.query.startDate);
          }
          if (typeof req.query.endDate === 'string') {
            endDate = new Date(req.query.endDate);
          }
          return ordersController.getOrders(user.email, startDate, endDate);
        })
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((err) => { res.status(500).send(err); });
    } else if (req.parsedToken.type >= userTypes.ADMIN) {
      ordersController.getOrdersByDate(new Date(req.query.currentDate)).then((response) => {
        res.status(200).send(response);
      }).catch((err) => { res.status(500).send(err); });
    } else { res.status(500).send(new Error()); }
  });

router.route('/')
  .put((req, res) => {
    User.findById({ _id: req.parsedToken.id })
      .then((user) => {
        req.body.username = user.email;
        return ordersController.addOrder(req.body);
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => { res.status(500).send(err); });
  });
module.exports = router;
