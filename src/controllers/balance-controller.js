import UserBalance from '../models/UserBalance';

export default {
  checkUserBalance, // eslint-disable-line
  getBalanceList, // eslint-disable-line
  updateUserBalance, // eslint-disable-line
};
const findError = {
  message: 'user not found',
};
function checkUserBalance(username) {
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

///////////////////////////////////////////////////
checkUserBalance('Eee').then((res) => {
  console.log(res);
});
checkUserBalance('Aaaaa').then((res) => {
  console.log(res);
});
