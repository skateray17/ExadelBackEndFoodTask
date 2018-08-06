import express from 'express';
import logsController from '../controllers/logs-controller';
import authorization from '../controllers/authorization';

const router = express.Router();

router.route('/')
  .get(authorization.authorizeAdmin)
  .get((req, res) => {
    const { startDate, endDate } = req.query;
    logsController.getLogs({ startDate, endDate })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });

module.exports = router;
