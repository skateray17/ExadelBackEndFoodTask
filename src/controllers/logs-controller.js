import MenuLogsController from './menu-log-controller';
import OrdersLogsController from './user-orders-log-controller';
import BalanceLogsController from './balance-log-controller';


function getLogs({ startDate, endDate }) {
  const obj = { startDate, endDate };
  return Promise.all([OrdersLogsController.getLogs(obj), MenuLogsController.getLogs(obj), BalanceLogsController.getLogs(obj)])
    .then((values) => {
      let arr = [];
      values.forEach((value) => {
        arr = arr.concat(value);
      });
      arr = arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime());
      return arr;
    });
}


export default {
  getLogs,
};
