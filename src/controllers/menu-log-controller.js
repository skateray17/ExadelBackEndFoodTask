import Moment from 'moment';
import MenuLog from '../models/MenuLog';

function log(menuDate, message, vendorName) {
  return new MenuLog({
    menuDate,
    vendorName,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}

function uploadMenu(menuDate, vendorName) {
  return log(menuDate, 'uploadMenu', vendorName);
}
function publishMenu(menuDate, vendorName) {
  return log(menuDate, 'publishMenu', vendorName);
}
function disableDay(menuDate, vendorName) {
  return log(menuDate, 'disableDay', vendorName);
}
function removeMenu(menuDate, vendorName) {
  return log(menuDate, 'removeMenu', vendorName);
}

function getLogs({ startDate, endDate, menuDate }) {
  startDate = Moment.parseZone(startDate || 0).utc();
  endDate = Moment.parseZone(endDate || Date.now()).utc();

  if (menuDate) {
    return MenuLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      menuDate,
    });
  }

  return MenuLog.find({
    logDate: { $gte: startDate, $lte: endDate },
  });
}

export default {
  uploadMenu,
  publishMenu,
  disableDay,
  removeMenu,
  getLogs,
};
