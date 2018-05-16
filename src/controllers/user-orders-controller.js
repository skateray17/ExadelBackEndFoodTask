import UserOrders from '../models/UserOrders';
import MenuController from '../controllers/menu-controller';


function getRefactoredDate(date, daysToAdd) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate() + daysToAdd));
}

function getOrders(
  username, startDate = getRefactoredDate(new Date(), 0),
  endDate = getRefactoredDate(new Date(), 7),
) {
  return UserOrders.find({ username, date: { $gte: startDate, $lte: endDate } })
    .then(obj => ({ result: obj }));
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
        date: obj.date, username: obj.username, totalPrice: obj.totalPrice, dishList: obj.dishList,
      },
    },
    { new: true, upsert: true },
  )).catch(err => err);
}
function getOrdersByDate(date) {
  const currentDate = getRefactoredDate(date, 0);
  return UserOrders.find({ date: { $eq: currentDate } })
    .then(obj => ({ result: obj }));
}
export default { getOrders, addOrder, getOrdersByDate };

