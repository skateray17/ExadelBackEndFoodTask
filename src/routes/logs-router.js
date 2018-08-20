import express from 'express';
import logsController from '../controllers/logs-controller';
import menuLogsController from '../controllers/menu-log-controller';
import balanceLogsController from '../controllers/balance-log-controller';
import userOrdersLogsControllers from '../controllers/user-orders-log-controller';

import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
  .get(authorization.authorizeAdmin)
  .get((req, res) => {
    const {
      startDate,
      endDate,
      type,
      menuDate,
      username,
      orderDate,
    } = req.query;
    switch (type) {
      case 'menu': {
        menuLogsController.getLogs({ startDate, endDate, menuDate })
          .then((response) => {
            res.status(200).send(response);
          })
          .catch((err) => {
            res.status(500).send(err);
          });

        break;
      }
      case 'balance': {
        balanceLogsController.getLogs({ startDate, endDate, username })
          .then((response) => {
            res.status(200).send(response);
          })
          .catch((err) => {
            res.status(500).send(err);
          });

        break;
      }
      case 'orders': {
        userOrdersLogsControllers.getLogs({
          startDate, endDate, orderDate, username,
        })
          .then((response) => {
            res.status(200).send(response);
          })
          .catch((err) => {
            res.status(500).send(err);
          });

        break;
      }
      default: {
        logsController.getLogs({ startDate, endDate })
          .then((response) => {
            res.status(200).send(response);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    }
  });


module.exports = router;
