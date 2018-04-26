import express from 'express';
import menuController from '../controllers/menu-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/addMenu')
  .post(authorization.authorizeAdmin)
  .post((req, res) => {
    const buffer = [];
    req.on('data', (chunk) => {
      buffer.push(chunk);
    }).on('end', () => {
      const file = Buffer.concat(buffer);
      menuController.addMenu(file)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    });
  });
router.route('/getMenu')
  .get((req, res) => {
    menuController.getMenu()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  });

module.exports = router;
