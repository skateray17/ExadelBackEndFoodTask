import accountController from './account-controller';
import userTypes from '../models/user-types';
import ExternalLinks from '../models/extrnal-links';
import axios from 'axios/index';

export default {
  // authorizeUser, // eslint-disable-line
  authorizeAdmin, // eslint-disable-line
};

// function authorize(req, res, next, type) {
//   (req.parsedToken ? Promise.resolve(req.parsedToken)
//     : accountController.untokenize(req.headers.authorization))
//     .then((token) => {
//       req.parsedToken = token;
//       if (!token || token.type < type) {
//         return Promise.reject();
//       }
//       return next();
//     })
//     .catch(() => {
//       res.status(403).send('No permissions');
//     });
// }
//
// function authorizeUser(req, res, next) {
//   authorize(req, res, next, userTypes.BASIC_USER);
// }

function authorizeAdmin(req, res, next) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.cookie },
    method: 'GET',
  }).then((response) => {
    console.log(response.data.permissions);
    if (response.data.permissions.includes('efds_admin')) {
      return next();
    }
    return res.status(401).end('NO PERMISSION');
  }).catch(() => res.status(500).end());
  // authorize(req, res, next, userTypes.ADMIN);
}
