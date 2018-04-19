import express from 'express';
import getOrders from '../controllers/user-orders-controller';


const router = express.Router();

router.route('/getUserOrders')
  .get((req, res) => {
    getOrders(req.query.username)
      .then((response) => {
        res.status(response.status).send(response.body);
      })
      .catch((err) => { res.status(500).send(err); });
  });
module.exports = router;
