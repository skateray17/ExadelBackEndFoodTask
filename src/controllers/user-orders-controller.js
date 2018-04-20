import UserOrders from '../models/UserOrders';


function searchSuitableDays(username, days) {
  const buffer = [];
  days.forEach((day) => {
    const dayOrder = day.orders.find((order) => {
      if (order.username === username) {
        return true;
      }
      return false;
    });
    if (dayOrder !== undefined) {
      buffer.push({ order: dayOrder, date: day.date });
    }
  });
  return buffer;
}

function getOrders(username) {
  return UserOrders.find({}).then(days => ({
    result: searchSuitableDays(username, days),
  }));
}

function addOrder(order) {
}
export default { getOrders, addOrder };

