import express from 'express';
import menuController from '../controllers/menu-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
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
  })
  .get((req, res) => {
    const MENUS = menuController.getActualMenus();
    res.status(200).send(MENUS);
  });

module.exports = router;
