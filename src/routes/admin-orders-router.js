import express from 'express';
import menuController from '../controllers/menu-controller';

const router = express.Router();

router.route('/')
  .put((req, res) => {
    menuController.markOrder()
      .then((menus) => {
        res.status(200).send(menus);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });

module.exports = router;
