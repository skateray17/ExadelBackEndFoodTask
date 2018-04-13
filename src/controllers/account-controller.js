import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';

export default {
  logon(req, callback) {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        callback(500, { token: null, auth: false, message: 'can\'t find user' });
      } else {
        const passHash = crypto.pbkdf2Sync(req.body.password, user.passwordSalt, process.env.CRYPTO_ITERATIONS, process.env.CRYPTO_KEYLEN, 'sha512');
        if (passHash !== user.passwordHash) {
          callback(401, { token: null, auth: false, message: 'Wrong password!' });
        } else {
          // eslint-disable-next-line no-underscore-dangle
          const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24 * 7, // expires in 7 days
          });
          callback(200, { auth: true, token });
        }
      }
    });
  },
  logoff() {

  },
};
