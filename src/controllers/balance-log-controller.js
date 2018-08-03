import BalanceLog from '../models/BalanceLog';
import Messages from '../models/Messages';


function log(username, message) {
  return new BalanceLog({
    username,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}
function replenishBalance(username, balance) {
  return log(username, `${Messages.replenishBalance + balance}BYN`);
}

function withdrawBalance(username, balance) {
  return log(username, `${Messages.withdrawBalance + balance}BYN`);
}

function updateBalance(username) {
  return log(username, Messages.updateBalance);
}

export default {
  replenishBalance,
  withdrawBalance,
  updateBalance,
};
