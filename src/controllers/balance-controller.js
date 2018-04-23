import UserBalance from '../models/UserBalance';

export default {
  addUserBalance, // eslint-disable-line
  getBalanceList, // eslint-disable-line
  changeUserBalance, // eslint-disable-line
};
const findError = {
  message: 'user not found',
};
function addUserBalance(username) {
  return UserBalance.findOne({ username })
    .then((user) => {
      if (user) {
        return user.balance;
      }
      const userBalance = new UserBalance({
        username,
        firstName: 'firstName', // Name and Surname using LDAP
        lastName: 'lastName',
        balance: 0,
      });
      userBalance.save();
      return 0;
    });
}
function getBalanceList() {
  const BalanceList = [];
  return UserBalance.find()
    .then((users) => {
      users.forEach((user) => {
        BalanceList.push({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
        });
      });
    })
    .then(() => (BalanceList));
}
function changeUserBalance(username, balance) {
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

///////////////////////////////////////////////////
addUserBalance('dsap').then((res) => {
  console.log(res);
});
addUserBalance('dsapq').then((res) => {
  console.log(res);
});
