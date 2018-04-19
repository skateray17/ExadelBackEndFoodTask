import UserBalance from '../models/UserBalance';

export default {
  addUserBalance, // eslint-disable-line
  getBalanceList, // eslint-disable-line
  changeUserBalance, // eslint-disable-line
};
const findError = {
  message: 'user not found',
};
function addUserBalance(email) {
  return UserBalance.findOne({ email }, (user) => {
    if (user) {
      return true;
    }
    const userBalance = new UserBalance({
      email,
      balance: 0,
    });
    userBalance.save();
    return true;
  });
}
function getBalanceList() {
  const BalanceList = [];
  return UserBalance.find()
    .then((users) => {
      users.forEach((user) => {
        BalanceList.push({
          email: user.email,
          balance: user.balance,
        });
      });
    })
    .then(() => (BalanceList));
}
function changeUserBalance(email, balance) {
  const newData = {
    email,
    balance,
  };
  return UserBalance.findOneAndUpdate({ email }, newData)
    .then((el) => {
      if (!el) {
        return Promise.reject(findError);
      }
      return Promise.resolve();
    });
}
