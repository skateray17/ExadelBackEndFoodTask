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
      res.send(menuController.addMenu(file));
    });
  });

module.exports = router;
