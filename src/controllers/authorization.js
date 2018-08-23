import axios from 'axios/index';
import ExternalLinks from '../models/extrnal-links';

export default {
  authorizeAdmin, // eslint-disable-line
};

function authorizeAdmin(req, res, next) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.cookie },
    method: 'GET',
  }).then((response) => {
    if (response.data.permissions.includes('efds_admin')) {
      return next();
    }
    return res.status(401).end('NO PERMISSION');
  }).catch(() => res.status(500).end());
  // authorize(req, res, next, userTypes.ADMIN);
}
