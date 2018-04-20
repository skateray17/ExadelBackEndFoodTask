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
          username: user.username, // Name and Surname using LDAP
          balance: user.balance,
        });
      });
    })
    .then(() => (BalanceList));
}
function changeUserBalance(name, surname, balance) {
  const username = name; // get username using Name and Surname with LDAP
  const newData = {
    username,
    balance,
  };
  return UserBalance.findOneAndUpdate({ username }, newData)
    .then((el) => {
      if (!el) {
        return Promise.reject(findError);
      }
      return Promise.resolve();
    });
}
addUserBalance('dsa').then((res) => {
  console.log(res);
});
