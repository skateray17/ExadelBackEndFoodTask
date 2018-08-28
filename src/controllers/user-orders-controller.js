import Moment from 'moment';
import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';
import UserBalanceController from '../controllers/balance-controller';
import UserOrdersLogController from '../controllers/user-orders-log-controller';
import balanceLogController from '../controllers/balance-log-controller';

// ПРИСЫЛАТЬ ВСЕ БЕЗ Z В КОНЦЕ!!!!!
function setMidnight(date) {
  return new Date(Moment.parseZone(date).utc().startOf('day'));
}

function addDaysToDate(date, daysToAdd) {
  date.setDate(date.getDate() + daysToAdd);
}

function getOrders(username, dates) {
  let { startDate, endDate } = dates;
  if (dates.startDate && dates.endDate) {
    startDate = setMidnight(startDate);
    endDate = setMidnight(endDate);

    return UserOrders.find({ username, date: { $gte: startDate, $lte: endDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.startDate) {
    startDate = setMidnight(startDate);

    return UserOrders.find({ username, date: { $gte: startDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.endDate) {
    endDate = setMidnight(endDate);

    return UserOrders.find({ username, date: { $lte: endDate } })
      .then(obj => ({ result: obj }));
  }
  return UserOrders.find({ username })
    .then(obj => ({ result: obj }));
}


function isOrderValid(order, vendorName, orderDate) {
  let maxTime = new Date();
  addDaysToDate(maxTime, 14);
  maxTime = setMidnight(maxTime);

  let minTime = new Date();
  minTime = setMidnight(minTime);
  let sum = 0;
  const MENU = MenuController.getCommonByDate(orderDate, vendorName)
    .concat(MenuController.getMenuByDate(orderDate, vendorName));

  if (orderDate.getTime() <= maxTime.getTime() && orderDate.getTime() >= minTime.getTime()) {
    if (order.dishList.length && order.dishList.every(dish => MENU.some((menuPoint) => {
      if (dish.dishTitle === menuPoint.name && dish.amount >= 0) {
        sum += parseFloat((dish.amount * menuPoint.cost).toFixed(2));
        return true;
      }
      return false;
    }))) {
      return parseFloat(sum.toFixed(2));
    }
  }
  if (!order.dishList.length) {
    return -1;
  }
  return 0;
}

function calculateOrderSum(order, vendorName) {
  order.date = setMidnight(new Date(order.date));

  const totalPrice = isOrderValid(order, vendorName, order.date);

  if (totalPrice) {
    return Promise.resolve(totalPrice);
  }
  return Promise.reject(new Error());
}

function addOrder(order, vendorName) {
  return calculateOrderSum(order, vendorName).then((totalPrice) => {
    const {
      date,
      username,
      dishList,
    } = order;

    if (totalPrice !== -1) {
      return UserOrders.findOne({ username, date, vendorName })
        .then((prevOrder) => {
          if (prevOrder !== null) {
            UserOrdersLogController.updateOrder(username, date);
            return UserBalanceController.updateUserBalance(order.username, prevOrder.totalPrice - totalPrice);
          }
          UserOrdersLogController.makeOrder(username, date);
          balanceLogController.updateBalance(username);
          return UserBalanceController.updateUserBalance(username, -totalPrice);
        })
        .then(() => UserOrders.update(
          { username, date, vendorName },
          {
            $set: {
              date,
              username,
              totalPrice,
              dishList,
            },
          },
          { new: true, upsert: true },
        ).then(() => (Promise.resolve({ totalPrice }))));
    }

    return UserOrders.findOne({ username, date, vendorName })
      .then((prevOrder) => {
        if (!prevOrder) {
          return Promise.resolve({ totalPrice: 0 });
        } return UserBalanceController.updateUserBalance(username, prevOrder.totalPrice);
      })
      .then(() => UserOrders.findOne({ username, date, vendorName })
        .remove()
        .exec(() => UserOrdersLogController.removeOrder(username, date)))
      .then(() => (Promise.resolve({ totalPrice: 0 })));
  });
}

function getOrdersByDate(date) {
  const currentDate = setMidnight(date);

  return UserOrders.find({ date: { $eq: currentDate } })
    .then(obj => ({ result: obj }));
}


function constructDate(day, month, year) {
  return Moment().utc().startOf('day').date(day)
    .month(month - 1)
    .year(year);
}

function splitDate(date) {
  const buffer = date.split('.');
  return constructDate(buffer[0], buffer[1], buffer[2]);
}

function isCurrentDayAvailable(weekDuration, currentDate, vendorName) {
  const MENU = MenuController.getActualMenus();
  let menuWithDayToCheck;

  if (MENU[0].length) {
    menuWithDayToCheck = MENU[0].find(el => (el.vendorName === vendorName && el.date === weekDuration)).menu;
  }
  if (!menuWithDayToCheck && MENU[1].length) {
    menuWithDayToCheck = MENU[1].find(el => (el.vendorName === vendorName && el.date === weekDuration)).menu;
  }
  const key = Object.keys(menuWithDayToCheck).find(day => menuWithDayToCheck[day].day !== undefined
    && menuWithDayToCheck[day].day.getTime() === currentDate.getTime());
  const tmp = menuWithDayToCheck[key];

  if (tmp !== undefined) return tmp.available;
  return true;
}
function increaseUserBalance(orders) {
  orders.forEach((order) => {
    UserBalanceController.updateUserBalance(order.username, order.totalPrice);
  });
}


function removeOrdersByDate(today, weekDuration, vendorName) {
  const currentDate = new Date(Moment.parseZone(today).utc().startOf('day'));
  const weekDates = weekDuration.split('-');
  const startWeekDate = new Date(splitDate(weekDates[0]));
  const endWeekDate = new Date(splitDate(weekDates[1]));

  const currentDayAvailability =
    isCurrentDayAvailable(weekDuration, currentDate, vendorName);
  if (currentDayAvailability === null) {
    return Promise.reject();
  }

  if (startWeekDate.getTime() <= currentDate.getTime()
    && currentDate.getTime() <= endWeekDate.getTime()) {
    if (currentDayAvailability) {
      return UserOrders.find({ date: { $gte: currentDate, $lte: endWeekDate } })
        .then((orders) => {
          increaseUserBalance(orders);
          return UserOrders.deleteMany({ date: { $gte: currentDate, $lte: endWeekDate }, vendorName });
        });
    }

    return UserOrders.find({ date: { $gt: currentDate, $lte: endWeekDate } })
      .then((orders) => {
        increaseUserBalance(orders);
        return UserOrders.deleteMany({ date: { $gt: currentDate, $lte: endWeekDate }, vendorName });
      });
  }
  if (currentDate.getTime() < startWeekDate.getTime()) {
    return UserOrders.find({ date: { $gte: startWeekDate, $lte: endWeekDate } })
      .then((orders) => {
        increaseUserBalance(orders);
        return UserOrders.deleteMany({ date: { $gte: startWeekDate, $lte: endWeekDate }, vendorName });
      });
  }
  return Promise.reject();
}

export default {
  getOrders,
  addOrder,
  getOrdersByDate,
  removeOrdersByDate,
};

