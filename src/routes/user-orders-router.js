import express from 'express';
import ordersController from '../controllers/user-orders-controller';
import Employee from '../models/Employee';
import accountController from '../controllers/account-controller';


const router = express.Router();


router.route('/')
  .get((req, res) => {
    accountController.getLoginStatus(req)
      .then((rvisionRes) => {
        if (req.query.currentDate === undefined) {
          return Employee.find({ email: rvisionRes.data.login })
            .then(user => ordersController
              .getOrders(user.email, { startDate: req.query.startDate, endDate: req.query.endDate }))
            .then((response) => {
              res.status(200).send(response);
            });
        } else if (rvisionRes.data.permissions.includes('efds_admin')) {
          return ordersController.getOrdersByDate(req.query.currentDate).then((response) => {
            res.status(200).send(response);
          });
        }
        return res.status(500).send(new Error());
      }).catch(err => res.status(500).send(err));
  });

router.route('/')
  .put((req, res) => {
    accountController.getLoginStatus(req)
      .then(rvisionRes => Employee.findById({ email: rvisionRes.data.login }))
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
