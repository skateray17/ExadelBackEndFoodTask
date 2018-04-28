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

function getOrdersForDate(date) {
  return UserOrders.find({}).then((users) => {
    const result = [];
    users.forEach((user) => {
      user.days.forEach((day) => {
        if (new Date(day.date).getTime() === date.getTime()) {
          result.push({
            username: user.username,
            dishList: day.dishList,
            totalPrice: day.totalPrice,
          });
        }
      });
    });
    return result;
  });
}

function addOrder(order) {}

export default { getOrders, addOrder, getOrdersForDate };

