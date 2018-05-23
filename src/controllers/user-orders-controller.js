import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';
import { updateUserBalance } from '../controllers/balance-controller';

// ПРИСЫЛАТЬ ВСЕ БЕЗ Z В КОНЦЕ!!!!!
function setMidnight(date) {
  date.setHours(0);
  date.setMinutes(0, 0, 0);
}

function addDaysToDate(date, daysToAdd) {
  date.setDate(date.getDate() + daysToAdd);
}

function getOrders(username, dates) {
  let startDate;
  let endDate;
  if (dates.startDate && dates.endDate) {
    startDate = new Date(dates.startDate);
    setMidnight(startDate);

    endDate = new Date(dates.endDate);
    setMidnight(endDate);
    return UserOrders.find({ username, date: { $gte: startDate, $lte: endDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.startDate) {
    startDate = new Date(dates.startDate);
    setMidnight(startDate);

    return UserOrders.find({ username, date: { $gte: startDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.endDate) {
    endDate = new Date(dates.endDate);
    setMidnight(endDate);

    return UserOrders.find({ username, date: { $lte: endDate } })
      .then(obj => ({ result: obj }));
  }
  return UserOrders.find({ username })
    .then(obj => ({ result: obj }));
}


function isOrderValid(order, orderDate) {
  const maxTime = new Date();
  addDaysToDate(maxTime, 14);
  setMidnight(maxTime);
  const minTime = new Date();
  setMidnight(minTime);
  let sum = 0;
  const MENU = MenuController.getCommonByDate(orderDate)
    .concat(MenuController.getMenuByDate(orderDate));


  if (orderDate.getTime() <= maxTime.getTime() && orderDate.getTime() >= minTime.getTime()) {
    if (order.dishList.length && order.dishList.every(dish => MENU.some((menuPoint) => {
      if (dish.dishTitle === menuPoint.name && dish.amount >= 0) {
        sum += parseFloat((dish.amount * menuPoint.cost).toFixed(2));
        return true;
      }
      return false;
    }))) {
      return sum.toFixed(2);
    }
  }
  if (!order.dishList.length) {
    return -1;
  }
  return 0;
}

function validateOrder(order) {
  const orderDate = new Date(order.date);
  setMidnight(orderDate);
  const sum = isOrderValid(order, orderDate);

  if (sum) {
    return Promise.resolve({
      username: order.username, dishList: order.dishList, date: orderDate, totalPrice: sum,
    });
  }
  return Promise.reject(new Error());
}

function addOrder(order) {
  return validateOrder(order).then((obj) => {
    if (obj.totalPrice !== -1) {
      return UserOrders.findOne({ username: order.username, date: obj.date })
        .then(tmp => updateUserBalance(order.username, tmp.totalPrice)
          .then(() => {
            updateUserBalance(order.username, -obj.totalPrice)
              .then(() => UserOrders.update(
                { username: order.username, date: obj.date },
                {
                  $set: {
                    date: obj.date,
                    username: obj.username,
                    totalPrice: obj.totalPrice,
                    dishList: obj.dishList,
                  },
                },
                { new: true, upsert: true },
              ).then(() => (Promise.resolve({ totalPrice: obj.totalPrice }))))
              .catch(() => updateUserBalance(order.username, -tmp.totalPrice).then(() => Promise.reject(new Error())));
          }));
    }
    return UserOrders.findOne({ username: order.username, date: obj.date })
      .then(tmp => updateUserBalance(order.username, tmp.totalPrice)
        .then(() => UserOrders.findOne({ username: order.username, date: obj.date }).remove().exec()
          .then(() => (Promise.resolve({ totalPrice: 0 })))));
  });
}

function getOrdersByDate(date) {
  const currentDate = new Date(date);
  setMidnight(currentDate);

  return UserOrders.find({ date: { $eq: currentDate } })
    .then(obj => ({ result: obj }));
}

export default { getOrders, addOrder, getOrdersByDate };

