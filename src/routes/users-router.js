import express from 'express';
import accountController from '../controllers/account-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
  .get(authorization.authorizeAdmin)
  .get((req, res) => {
    accountController.findUsers(req.query.str)
      .then(arr => res.status(200).send({ arr }))
      .catch(err => res.status(500).send(err));
  });

module.exports = router;
