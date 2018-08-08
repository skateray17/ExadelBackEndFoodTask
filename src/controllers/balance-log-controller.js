import Moment from 'moment/moment';
import BalanceLog from '../models/BalanceLog';

function log(username, message, currency, balanceChange) {
  return new BalanceLog({
    username,
    message,
    logDate: Math.floor(Date.now()),
    balanceChange,
    currency,
  }).save();
}
function replenishBalance(username, balanceChange) {
  return log(username, 'replenishBalance', 'BYN', balanceChange);
}

function withdrawBalance(username, balanceChange) {
  return log(username, 'withdrawBalance', 'BYN', balanceChange);
}

function updateBalance(username, balanceChange) {
  return log(username, 'updateBalance', 'BYN', balanceChange);
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
