import accountController from './account-controller';
import userTypes from '../models/user-types';

export default {
  authorizeUser, // eslint-disable-line
  authorizeAdmin, // eslint-disable-line
};

function authorize(req, res, next, type) {
  (req.parsedToken ? Promise.resolve(req.parsedToken)
    : accountController.untokenize(req.headers.authorization))
    .then((token) => {
      req.parsedToken = token;
      if (!token || token.type < type) {
        return Promise.reject();
      }
      return next();
    })
    .catch(() => {
      res.status(403).send('No permissions');
    });
}

function authorizeUser(req, res, next) {
  authorize(req, res, next, userTypes.BASIC_USER);
}

function authorizeAdmin(req, res, next) {
  authorize(req, res, next, userTypes.ADMIN);
}
