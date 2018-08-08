import BalanceLog from '../models/BalanceLog';
import Messages from '../models/Messages';
import Moment from 'moment/moment';

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
function getLogs({ startDate, endDate, username }) {
  startDate = Moment.parseZone(startDate || 0).utc();
  endDate = Moment.parseZone(endDate || Date.now()).utc();

  if (username) {
    return BalanceLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      username,
    });
  }

  return BalanceLog.find({
    logDate: { $gte: startDate, $lte: endDate },
  });
}


export default {
  replenishBalance,
  withdrawBalance,
  updateBalance,
  getLogs,
};
