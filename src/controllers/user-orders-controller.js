import UserOrders from '../models/UserOrders';


function searchSuitableDays(username, days, buffer) {
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
}
export default function getOrders(username) {
  try {
    return new Promise((res) => {
      const buffer = [];
      UserOrders.find({}, (err, days) => {
        if (err) throw err;
        searchSuitableDays(username, days, buffer);
        return res({
          status: 200,
          body: { result: buffer },
        });
      });
    });
  } catch (e) {
    return new Promise((res) => {
      res({
        status: 501,
        body: { message: 'some error' },
      });
    });
  }
}
