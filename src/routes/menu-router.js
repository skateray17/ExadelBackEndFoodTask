import express from 'express';
import menuController from '../controllers/menu-controller';

const router = express.Router();

router.route('/addMenu')
  .post((req, res) => {
    const buffer = [];
    req.on('data', (chunk) => {
      buffer.push(chunk);
    }).on('end', () => {
      const file = Buffer.concat(buffer);
      menuController.addMenu(file)
        .then((response) => {
          res.status(response.status).send(response.body);
        });
    });
  });
router.route('/getMenu')
  .get((req, res) => {
    menuController.getMenu()
      .then((response) => {
        res.status(response.status).send(response.body);
      });
  });

module.exports = router;
