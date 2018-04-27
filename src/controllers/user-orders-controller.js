import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';

function getRefactoredDate(date, daysToAdd) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToAdd);
}

function getOrders(
  username, startDate = getRefactoredDate(new Date(), 0),
  endDate = getRefactoredDate(new Date(), 8),
) {
  return UserOrders.findOne({ username }).then(user => ({
    result: user.days.filter(item => item.date.getTime() > startDate.getTime()
        && item.date.getTime() < endDate.getTime()),
  }));
}

function isOrderValid(order, currentDate) {
  const maxTime = getRefactoredDate(new Date(), 7);
  const minTime = getRefactoredDate(new Date(), 0);
  let sum = 0;
  const MENU = MenuController.getCommonByDate(currentDate)
    .concat(MenuController.getMenuByDate(currentDate));

  if (currentDate.getTime() <= maxTime.getTime() && currentDate.getTime() > minTime.getTime() &&
        order.dishList.every(dish => MENU.some((menuPoint) => {
          if (dish.dishTitle === menuPoint.name) {
            sum += dish.amount * menuPoint.cost;
            return true;
          }
          return false;
        }))) {
    return sum;
  }
  return 0;
}

function validateOrder(order) {
  const currentDate = getRefactoredDate(new Date(order.date), 0);
  const sum = isOrderValid(order, currentDate);
  if (sum) {
    return Promise.resolve({ dishList: order.dishList, date: currentDate, totalPrice: sum });
  }
  return Promise.reject(new Error());
}

function addOrder(order) {
  return validateOrder(order).then(obj => UserOrders.findOneAndUpdate(
    { username: order.username },
    { $pull: { days: { date: obj.date } } },
  ).then(() => UserOrders.findOneAndUpdate(
    { username: order.username }, {
      $push: { days: obj },
    },
    { new: true },
  ))).catch(err => err);
}
export default { getOrders, addOrder };

