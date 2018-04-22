import UserOrders from '../models/UserOrders';
import MenuLogic from '../controllers/menu-controller';

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
function validateOrder(order) {
  const MENU = MenuLogic.getMenu();
  let sum = 0;
  return Object.values(MENU.menu).some((item) => {
    if (item.day === order.date) {
      const availableItemsForOrder = item.menu.concat(MENU.menu.common.menu);
      return order.order.dishList.every(dish => availableItemsForOrder.some((itemForOrder) => {
        if (itemForOrder.name === dish.dishTitle) {
          sum += itemForOrder.cost * dish.amount;
          return true;
        }
        return false;
      }));
    }
    return false;
  }) && sum === order.order.totalPrice;
}

function addOrder(obj) {
  if (validateOrder(obj)) {
    return UserOrders.findOneAndUpdate(
      { date: obj.date },
      {
        $set: {
          orders: {
            username: obj.order.username,
            dishList: obj.order.dishList,
            totalPrice: obj.order.totalPrice,
          },
        },
      },
      { new: true, upsert: true },
    );
  }
  return new Error('Invalid order or there is no suitable menu');
}
export default { getOrders, addOrder };

