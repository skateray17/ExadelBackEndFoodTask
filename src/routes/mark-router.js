import express from 'express';
import menuController from '../controllers/menu-controller';

const router = express.Router();

router.route('/')
  .put((req, res) => {
    menuController.markOrder()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  });

module.exports = router;
