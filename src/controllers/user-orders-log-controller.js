import UserOrdersLog from '../models/UserOrdersLog';
import Messages from '../models/Messages';

function log(username, orderDate, message) {
  return new UserOrdersLog({
    username,
    orderDate,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}
function makeOrder(username, date) {
  return log(username, date, Messages.makeOrder);
}

function removeOrder(username, date) {
  return log(username, date, Messages.removeOrder);
}

function updateOrder(username, date) {
  return log(username, date, Messages.updateOrder);
}


export default {
  makeOrder,
  removeOrder,
  updateOrder,
};
