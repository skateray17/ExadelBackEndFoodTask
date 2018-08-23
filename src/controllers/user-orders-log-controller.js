import Moment from 'moment/moment';
import UserOrdersLog from '../models/UserOrdersLog';

function log(username, orderDate, message) {
  return new UserOrdersLog({
    username,
    orderDate,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}
function makeOrder(username, date) {
  return log(username, date, 'makeOrder');
}

function removeOrder(username, date) {
  return log(username, date, 'removeOrder');
}

function updateOrder(username, date) {
  return log(username, date, 'updateOrder');
}

function getLogs({
  startDate,
  endDate,
  username,
  orderDate,
}) {
  startDate = Moment.parseZone(startDate || 0).utc();
  endDate = Moment.parseZone(endDate || Date.now()).utc();

  if (username && orderDate) {
    return UserOrdersLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      username,
      orderDate,
    }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
  }
  if (username) {
    return UserOrdersLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      username,
    }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
  }
  if (orderDate) {
    return UserOrdersLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      orderDate,
    }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
  }

  return UserOrdersLog.find({
    logDate: { $gte: startDate, $lte: endDate },
  }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
}

export default {
  makeOrder,
  removeOrder,
  updateOrder,
  getLogs,
};
