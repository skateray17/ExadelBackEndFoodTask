import MenuLogsController from './menu-log-controller';
import OrdersLogsController from './user-orders-log-controller';
import BalanceLogsController from './balance-log-controller';


function getLogs({ startDate, endDate }) {
  const obj = { startDate, endDate };
  return Promise.all([OrdersLogsController.getLogs(obj), MenuLogsController.getLogs(obj), BalanceLogsController.getLogs(obj)])
    .then((values) => {
      const arr = [];
      values.forEach(value => arr.concat(value));
      return arr;
    });
}

export default {
  getLogs,
};
