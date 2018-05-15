import UserBalance from '../models/UserBalance';

export default {
  checkUserBalance, // eslint-disable-line
  updateUserBalance, // eslint-disable-line
  findUsers, // eslint-disable-line
};
const findError = {
  message: 'user not found',
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
  const newData = {
    username,
    balance,
  };
  return UserBalance.findOneAndUpdate({ username }, { $set: newData })
    .then((el) => {
      if (!el) {
        return Promise.reject(findError);
      }
      return Promise.resolve();
    });
}

function seachByNameAndSurname(name) {
  const regex = new RegExp(`^${name}.*`, 'i');
  return UserBalance.find({
    $where: `((this.firstName + ' ' + this.lastName).match(${regex}) || (this.lastName + ' ' + this.firstName).match(${regex})) !== null`,
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
