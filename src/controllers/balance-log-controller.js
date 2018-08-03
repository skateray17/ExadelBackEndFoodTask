import BalanceLog from '../models/BalanceLog';
import Messages from '../models/Messages';

function constructMessage(msg) {
  return { message: msg, logDate: Math.floor(Date.now()) };
}
function log(username, message) {
  return BalanceLog.update(
    { username },
    {
      $set: {
        username,
      },
      $push: { logs: constructMessage(message) },
    },
    { new: true, upsert: true },
  );
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
