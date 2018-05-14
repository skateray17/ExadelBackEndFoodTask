import express from 'express';
import menuController from '../controllers/menu-controller';

const router = express.Router();

router.route('/')
  .put((req, res) => {
    menuController.markOrder()
      .then(() => {
        res.status(200).send();
      });
  });

module.exports = router;
