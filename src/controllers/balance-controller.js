import UserBalance from '../models/UserBalance';

const BALANCE_LIMIT = -20;
export default {
  checkUserBalance, // eslint-disable-line
  updateUserBalance, // eslint-disable-line
  findUsers, // eslint-disable-line
  findUserByUsername,// eslint-disable-line
};
const findError = {
  message: 'user not found',
};
const limitError = {
  message: 'limit exceeded',
};
function checkUserBalance(username, firstName, lastName) {
  return UserBalance.findOne({ username })
    .then((user) => {
      if (user) {
        return user.balance;
      }
      const userBalance = new UserBalance({
        username,
        firstName, // Name and Surname using LDAP
        lastName,
        balance: 0,
      });
      userBalance.save();
      return 0;
    });
}

function updateUserBalance(username, balance) {
  return UserBalance.findOne({ username })
    .then((el) => {
      if (el) {
        if (el.balance + balance < BALANCE_LIMIT) {
          return Promise.reject(limitError);
        }
        el.balance += balance;
        el.balance = Number.parseFloat(el.balance.toFixed(2));
        el.save();
        return Promise.resolve({ balance: el.balance });
      }
      return Promise.reject(findError);
    });
}

function seachByNameAndSurname(name) {
  return UserBalance.find({
    $where: `(this.firstName + ' ' + this.lastName).startsWith('${name}') || (this.lastName + ' ' + this.firstName).startsWith('${name}')`,
  });
}

const USERS_PER_PAGE = 15;

function findUsers(name = '', page = 1) {
  if (!Number.isInteger(page)) page = 1;
  if (page <= 0) return Promise.reject();
  return seachByNameAndSurname(name)
    .sort({ lastName: 1, firstName: 1, username: 1 })
    .then((arr) => {
      const response = {
        totalAmount: arr.length,
        result: arr.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE),
        currentPage: page,
      };
      return response;
    });
}

function findUserByUsername(username) {
  return UserBalance.findOne({ username });
}
