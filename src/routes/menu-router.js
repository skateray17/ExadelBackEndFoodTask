import express from 'express';
import menuController from '../controllers/menu-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
  .post(authorization.authorizeAdmin)
  .post((req, res) => {
    const { date } = req.query;
    const buffer = [];
    req.on('data', (chunk) => {
      buffer.push(chunk);
    }).on('end', () => {
      const file = Buffer.concat(buffer);
      menuController.addMenu(file, date)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    });
  })
  .put(authorization.authorizeAdmin)
  .put((req, res) => {
    if ('published' in req.body) {
      menuController.publishMenu(req.body)
        .then(() => {
          res.status(200).send();
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    } else if ('mark' in req.body) {
      menuController.markOrder(req.body.mark)
        .then(() => {
          res.status(200).send();
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    } else {
      res.status(500).send();
    }
  })
  .get((req, res) => {
    const MENUS = menuController.getActualMenus();
    res.status(200).send(MENUS);
  });

module.exports = router;
