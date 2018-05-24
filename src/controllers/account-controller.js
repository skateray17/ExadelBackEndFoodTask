import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import userTypes from '../models/user-types';
import balanceController from './balance-controller';

export default {
  login, // eslint-disable-line
  untokenize, // eslint-disable-line
};

function crypt(message, salt) {
  console.log(arguments);
  return crypto.pbkdf2Sync(
    message, salt, Number.parseInt(process.env.CRYPTO_ITERATIONS, 10),
    Number.parseInt(process.env.CRYPTO_KEYLEN, 10), 'sha512',
  ).toString('hex');
}

function untokenize(token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      return resolve(decodedToken);
    });
  });
}

function login(req) {
  console.log(req);
  return User.findOne({ email: req.email })
    .then((user) => {
      const passHash = crypt(req.password, user.passwordSalt);
      console.log(passHash, user.passwordHash);
      if (passHash !== user.passwordHash) {
        return Promise.reject();
      }
      // eslint-disable-next-line no-underscore-dangle
      const token = JWT.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 * 7, // expires in 7 days
      });
      balanceController.checkUserBalance(user.email, user.firstName, user.lastName);
      return {
        status: 200,
        response: {
          token,
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type,
        },
      };
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
function addUser(email, password, firstName, lastName, role = userTypes.BASIC_USER) {
  if (!email || !password) return Promise.reject();
  return User.findOne({ email })
    .then((res) => { if (!res) throw res; })
    .catch(() => {
      const salt = crypto.randomBytes(64).toString('hex');
      const user = new User({
        email,
        type: role,
        passwordHash: crypt(password, salt),
        firstName,
        lastName,
        passwordSalt: salt,
      });
      return user.save()
        .catch(err => console.log(err));
    });
  // return true;
}
// for local tests

// const emtoAdd = 'ccc';
// const pass = '123';
//
// User.remove({ email: emtoAdd }). then(() => addUser(emtoAdd, pass, 'Pashka', 'Romashka').then(() => login({ email: emtoAdd, password: pass })).then(res => console.log(res)));
// User.find().then(res => console.log(res));
