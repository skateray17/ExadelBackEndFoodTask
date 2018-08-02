import UserOrdersLog from '../models/UserOrdersLog';
import Messages from '../models/Messages';

function constructMessage(msg) {
  return { message: msg, logDate: Math.floor(Date.now()) };
}
function makeOrder(username, date) {
  return UserOrdersLog.update(
    { username, orderDate: date },
    {
      $set: {
        orderDate: date,
        username,
      },
      $push: { logs: constructMessage(Messages.makeOrder) },

    },
    { new: true, upsert: true },
  );
}

function removeOrder(username, date) {
  return UserOrdersLog.update(
    { username, orderDate: date },
    {
      $set: {
        orderDate: date,
        username,
      },
      $push: { logs: constructMessage(Messages.removeOrder) },

    },
    { new: true, upsert: true },
  );
}

function updateOrder(username, date) {
  return UserOrdersLog.update(
    { username, orderDate: date },
    {
      $set: {
        orderDate: date,
        username,
      },
      $push: { logs: constructMessage(Messages.updateOrder) },

    },
    { new: true, upsert: true },
  );
}
export default {
  makeOrder,
  removeOrder,
  updateOrder,
};
