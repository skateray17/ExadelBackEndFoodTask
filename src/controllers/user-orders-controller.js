import Moment from 'moment';
import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';
import UserBalanceController from '../controllers/balance-controller';

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
      return parseFloat(sum.toFixed(2));
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
        .then((tmp) => {
          if (tmp !== null) {
            return UserBalanceController.updateUserBalance(order.username, tmp.totalPrice - obj.totalPrice);
          }
          return UserBalanceController.updateUserBalance(order.username, -obj.totalPrice);
        })
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
        ).then(() => (Promise.resolve({ totalPrice: obj.totalPrice }))));
    }

    return UserOrders.findOne({ username: order.username, date: obj.date })
      .then(tmp => {
        if (!tmp) {
          return Promise.resolve({ totalPrice: 0 });
        }
        UserBalanceController.updateUserBalance(order.username, tmp.totalPrice)
      }
      )
      .then(() => UserOrders
      .findOne({ username: order.username, date: obj.date }).remove().exec()
        .then(() => (Promise.resolve({ totalPrice: 0 }))));
  });
}

function getOrdersByDate(date) {
  const currentDate = new Date(date);
  setMidnight(currentDate);

  return UserOrders.find({ date: { $eq: currentDate } })
    .then(obj => ({ result: obj }));
}


function constructDate(day, month, year) {
  const tempDate = Moment().utc().startOf('day').date(day)
    .month(month - 1)
    .year(year);

  return tempDate;
}

function splitDate(date) {
  const buffer = date.split('.');
  return constructDate(buffer[0], buffer[1], buffer[2]);
}

function isCurrentDayAvailable(weekDuration, currentDate) {
  let MENU = MenuController.getActualMenus();


  if (MENU[0] !== undefined && MENU[0].date === weekDuration) {
    MENU = MENU[0];
  } else if (MENU[1] !== undefined && MENU[1].date === weekDuration) {
    MENU = MENU[1];
  } else {
    return null;
  }

  const key = Object.keys(MENU).find((day) => {
    if (MENU[day].day !== undefined
        && MENU[day].day.getTime() === currentDate.getTime()) { return true; }
    return false;
  });
  const tmp = MENU[key];

  if (tmp !== undefined) return tmp.available;
  return true;
}
function increaseUserBalance(orders) {
  orders.forEach((order) => {
    UserBalanceController.updateUserBalance(order.username, order.totalPrice);
  });
}


function removeOrdersByDate(today, weekDuration) {
  const currentDate = new Date(Moment.parseZone(today).utc().startOf('day'));
  const weekDates = weekDuration.split('-');
  const startWeekDate = new Date(splitDate(weekDates[0]));
  const endWeekDate = new Date(splitDate(weekDates[1]));

  const currentDayAvailability =
  isCurrentDayAvailable(weekDuration, currentDate);
  if (currentDayAvailability === null) {
    return Promise.reject();
  }


  if (startWeekDate.getTime() <= currentDate.getTime()
       && currentDate.getTime() <= endWeekDate.getTime()) {
    if (currentDayAvailability) {
      return UserOrders.find({ date: { $gte: currentDate, $lte: endWeekDate } })
        .then((orders) => {
          increaseUserBalance(orders);
          return UserOrders.deleteMany({ date: { $gte: currentDate, $lte: endWeekDate } });
        });
    }

    return UserOrders.find({ date: { $gt: currentDate, $lte: endWeekDate } })
      .then((orders) => {
        increaseUserBalance(orders);
        return UserOrders.deleteMany({ date: { $gt: currentDate, $lte: endWeekDate } });
      });
  }
  if (currentDate.getTime() < startWeekDate.getTime()) {
    return UserOrders.find({ date: { $gte: startWeekDate, $lte: endWeekDate } })
      .then((orders) => {
        increaseUserBalance(orders);
        return UserOrders.deleteMany({ date: { $gte: startWeekDate, $lte: endWeekDate } });
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

