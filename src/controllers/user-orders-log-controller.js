import UserOrdersLog from '../models/UserOrdersLog';
import Messages from '../models/Messages';

function constructMessage(msg) {
  return { message: msg, logDate: Math.floor(Date.now()) };
}
function log(username, date, message) {
  return UserOrdersLog.update(
    { username, orderDate: date },
    {
      $set: {
        orderDate: date,
        username,
      },
      $push: { logs: constructMessage(message) },

    },
    { new: true, upsert: true },
  );
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
