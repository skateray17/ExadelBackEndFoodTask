import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';

// ПРИСЫЛАТЬ ВСЕ БЕЗ Z В КОНЦЕ!!!!!
function setMidnight(date) {
  date.setHours(0);
  date.setMinutes(0, 0, 0);
}

function addDaysToDate(date, daysToAdd) {
  date.setDate(date.getDate() + daysToAdd);
}

function castToValidTimezone(date) {
  date.setHours(date.getHours() + 3);
}

function getOrders(username, dates) {
  let startDate;
  let endDate;
  if (dates.startDate && dates.endDate) {
    startDate = new Date(dates.startDate);
    castToValidTimezone(startDate);
    setMidnight(startDate);

    endDate = new Date(dates.endDate);
    castToValidTimezone(endDate);
    setMidnight(endDate);
    return UserOrders.find({ username, date: { $gte: startDate, $lte: endDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.startDate) {
    startDate = new Date(dates.startDate);
    castToValidTimezone(startDate);
    setMidnight(startDate);

    return UserOrders.find({ username, date: { $gte: startDate } })
      .then(obj => ({ result: obj }));
  } else if (dates.endDate) {
    endDate = new Date(dates.endDate);
    castToValidTimezone(endDate);
    setMidnight(endDate);

    return UserOrders.find({ username, date: { $lte: endDate } })
      .then(obj => ({ result: obj }));
  }
  return UserOrders.find({ username })
    .then(obj => ({ result: obj }));
}


function isOrderValid(order, currentDate) {
  const maxTime = new Date();
  castToValidTimezone(maxTime);
  addDaysToDate(maxTime, 14);
  setMidnight(maxTime);
  const minTime = new Date();
  castToValidTimezone(minTime);
  setMidnight(minTime);
  let sum = 0;
  const MENU = MenuController.getCommonByDate(currentDate)
    .concat(MenuController.getMenuByDate(currentDate));


  if (currentDate.getTime() <= maxTime.getTime() && currentDate.getTime() >= minTime.getTime()) {
    if (order.dishList.every(dish => MENU.some((menuPoint) => {
      if (dish.dishTitle === menuPoint.name && dish.amount >= 0) {
        sum += dish.amount * menuPoint.cost;
        return true;
      }
      return false;
    }))) {
      return sum;
    }
  }
  return 0;
}

function validateOrder(order) {
  const currentDate = new Date(order.date);
  castToValidTimezone(currentDate);
  setMidnight(currentDate);
  const sum = isOrderValid(order, currentDate);
  if (sum) {
    return Promise.resolve({
      username: order.username, dishList: order.dishList, date: currentDate, totalPrice: sum,
    });
  }
  return Promise.reject(new Error());
}

function addOrder(order) {
  return validateOrder(order).then(obj => UserOrders.update(
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

function getOrdersByDate(date) {
  const currentDate = new Date(date);
  castToValidTimezone(currentDate);
  setMidnight(currentDate);

  return UserOrders.find({ date: { $eq: currentDate } })
    .then(obj => ({ result: obj }));
}

export default { getOrders, addOrder, getOrdersByDate };

