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

export default function getOrders(username) {
  return UserOrders.find({}).then(days => ({
    status: 200,
    body: { result: searchSuitableDays(username, days) },
  }));
}

