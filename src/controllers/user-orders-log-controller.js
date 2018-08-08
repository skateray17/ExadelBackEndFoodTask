import UserOrdersLog from '../models/UserOrdersLog';
import Messages from '../models/Messages';
import Moment from 'moment/moment';

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
    });
  }
  if (username) {
    return UserOrdersLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      username,
    });
  }
  if (orderDate) {
    return UserOrdersLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      orderDate,
    });
  }

  return UserOrdersLog.find({
    logDate: { $gte: startDate, $lte: endDate },
  });
}

export default {
  makeOrder,
  removeOrder,
  updateOrder,
  getLogs,
};
