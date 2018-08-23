import express from 'express';
import menuController from '../controllers/menu-controller';
import authorization from '../controllers/authorization';
import ordersController from '../controllers/user-orders-controller';

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
    } else if ('available' in req.body) {
      menuController.setOrderAvailability(req.body.available)
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
  })

  .delete(authorization.authorizeAdmin)
  .delete((req, res) => {
    menuController.removeMenuByDate(req.body.date)
      .then(() => ordersController.removeOrdersByDate(req.body.today, req.body.date))
      .then(() => menuController.updateCachedMenu())
      .then(() => res.status(200).send(menuController.getActualMenus()))
      .catch(err => res.status(500).send(err));
  });


module.exports = router;
