import accountController from '../controllers/account-controller';

export default {
  authorizeAdmin, // eslint-disable-line
};

function authorizeAdmin(req, res, next) {
  return accountController.getLoginStatus(req, res).then((response) => {
    if (response.data.permissions.includes('efds_admin')) {
      return next();
    }
    return res.status(403).end('NO PERMISSION');
  }).catch(() => res.status(401).end('Login status error'));
}
