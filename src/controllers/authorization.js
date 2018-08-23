import accountController from '../controllers/account-controller';

export default {
  authorizeAdmin, // eslint-disable-line
};

function authorizeAdmin(req, res, next) {
  return accountController.getLoginStatus(req).then((response) => {
    if (response.data.permissions.includes('efds_admin')) {
      return next();
    }
    return res.status(401).end('NO PERMISSION');
  }).catch(() => res.status(500).end());
}
