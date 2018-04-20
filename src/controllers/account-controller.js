import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import userTypes from '../models/user-types';

export default {
  login, // eslint-disable-line
  untokenize, // eslint-disable-line
};

function crypt(message, salt) {
  return crypto.pbkdf2Sync(
    message, salt, Number.parseInt(process.env.CRYPTO_ITERATIONS, 10),
    Number.parseInt(process.env.CRYPTO_KEYLEN, 10), 'sha512',
  ).toString('hex');
}

function untokenize(token) {
  return JWT.verify(token, process.env.JWT_SECRET);
}

function login(req) {
  return User.findOne({ email: req.email })
    .then((user) => {
      const passHash = crypt(req.password, user.passwordSalt);
      if (passHash !== user.passwordHash) {
        return Promise.reject();
      }
      // eslint-disable-next-line no-underscore-dangle
      const token = JWT.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 * 7, // expires in 7 days
      });
      return { status: 200, response: { token } };
    })
    .catch(() => Promise.reject(new Error(JSON.stringify({
      status: 401,
      response: {
        message: 'Invalid username or password',
      },
    }))));
}

/**
 * @description т.к. у нас не будет реистрации, то она сделана просто для добавления пользователей
 * в DB, а также тестирования авторизациии
 */
function addUser(email, password, name, role = userTypes.BASIC_USER) {
  if (!email || !password) return false;
  User.findOne({ email })
    .then((res) => { if (!res) throw res; })
    .catch(() => {
      const salt = crypto.randomBytes(64).toString('hex');
      const user = new User({
        email,
        type: role,
        passwordHash: crypt(password, salt),
        name,
        passwordSalt: salt,
      });
      user.save()
        .catch(err => console.log(err));
    });
  return true;
}
