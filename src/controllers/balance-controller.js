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

function seachByNameOrNameAndSurname(arr) {
  if (arr.length >= 3) {
    return Promise.reject(new Error([]));
  }
  let regex;
  if (arr.length === 2) {
    regex = new RegExp(`^${arr[1]}.*`, 'i');
    return UserBalance.find({
      $or: [{
        firstName: arr[0],
        lastName: { $regex: regex },
      }, {
        firstName: { $regex: regex },
        lastName: arr[0],
      }],
    });
  }
  regex = new RegExp(`^${arr[0]}.*`, 'i');
  return UserBalance.find({
    $or: [{
      firstName: { $regex: regex },
    }, {
      lastName: { $regex: regex },
    }],
  });
}

const USERS_PER_PAGE = 15;

function findUsers(name = '', page = 1) {
  if (!Number.isInteger(page)) page = 1;
  if (page <= 0) return Promise.reject();
  const splited = name.split(' ');
  return seachByNameOrNameAndSurname(splited)
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
