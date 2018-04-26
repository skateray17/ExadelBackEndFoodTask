import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import userTypes from '../models/user-types';

export default {
  login, // eslint-disable-line
  untokenize, // eslint-disable-line
  findUsers, //eslint-disable-line
};

function crypt(message, salt) {
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
      return { status: 200, response: { token, username: user.name, type: user.type } };
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
  if (!email || !password) return false;
  User.findOne({ email })
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
      user.save()
        .catch(err => console.log(err));
    });
  return true;
}

function findUsers(name) {
  const splited = name.split(' ');
  if (splited.length >= 3) {
    return Promise.resolve([]);
  }
  let regex;
  if (splited.length === 2) {
    regex = new RegExp(`^${splited[1]}.*`, 'i');
    return Promise.all([User.find({
      firstName: splited[0],
      lastName: { $regex: regex },
    }), User.find({
      firstName: { $regex: regex },
      lastName: splited[0],
    })])
      .then(res => res[0].concat(res[1]).filter((el, ind, self) =>
        self.findIndex(elem => el._id.toString() === elem._id.toString()) === ind));
  }
  regex = new RegExp(`^${splited[0]}.*`, 'i');
  return Promise.all([
    User.find({ firstName: { $regex: regex } }),
    User.find({ lastName: { $regex: regex } }),
  ])
    .then(res => res[0].concat(res[1]).filter((el, ind, self) =>
      self.findIndex(elem => el._id.toString() === elem._id.toString()) === ind));
}
