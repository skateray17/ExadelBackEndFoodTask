import express from 'express';
import User from '../models/User';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    User.findById({ _id: req.parsedToken.id }, {
      passwordHash: 0, passwordSalt: 0, _id: 0, __v: 0,
    })
      .then((user) => {
        if (!user) return Promise.reject();
        return res.send(user);
      })
      .catch(err => res.status(500).send(err));
  });

module.exports = router;
