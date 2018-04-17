import express from 'express';
import getOrders from '../controllers/user-orders-controller';


const router = express.Router();

router.route('/getUserOrders')
  .get((req, res) => {
    getOrders(req.query.username).then((response) => {
      console.log(response.body);
      res.status(response.status).send(response.body);
    });
  });
module.exports = router;
