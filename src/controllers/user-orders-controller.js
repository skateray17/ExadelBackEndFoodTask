import UserOrders from '../models/UserOrders';
import MenuLogic from '../controllers/menu-controller';

function getOrders(
  username, startDate = new Date(new Date().setDate(new Date().getDate() - 8)),
  endDate = new Date(new Date().setDate(new Date().getDate() + 8)),
) {
  return UserOrders.findOne({ username }).then(user => ({
    result: user.days.filter((item) => {
      console.log(item.date.getTime() > startDate.getTime());
      return item.date.getTime() > startDate.getTime()
        && item.date.getTime() < endDate.getTime();
    }),
  }));
}

function validateOrder(order) {
  return new Promise((resolve, rej) => {
    const tmpDate = new Date(order.date);
    const now = new Date();
    const maxTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const minTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate());
    const MENU = MenuLogic.getCommonByDate(currentDate).concat(MenuLogic.getMenuByDate(currentDate));


    let sum = 0;
    if (currentDate.getTime() <= maxTime.getTime() && currentDate.getTime() > minTime.getTime() &&
        order.dishList.every(dish => MENU.some((menuPoint) => {
          if (dish.dishTitle === menuPoint.name) {
            sum += dish.amount * menuPoint.cost;
            return true;
          }
          return false;
        }))) {
      resolve({ dishList: order.dishList, date: currentDate, totalPrice: sum });
    }
    rej(new Error());
  });
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

