import express from 'express';
import VendorsController from '../controllers/vendor-controller';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    VendorsController.getVendors()
      .then((vendors) => {
        if (!vendors) return Promise.reject();
        return res.send(vendors);
      })
      .catch(err => res.status(500).send(err));
  });

module.exports = router;
