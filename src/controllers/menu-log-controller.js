import Moment from 'moment';
import MenuLog from '../models/MenuLog';

function log(menuDate, message) {
  return new MenuLog({
    menuDate,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}

function uploadMenu(menuDate) {
  return log(menuDate, 'uploadMenu');
}
function publishMenu(menuDate) {
  return log(menuDate, 'publishMenu');
}
function disableDay(menuDate) {
  return log(menuDate, 'disableDay');
}
function removeMenu(menuDate) {
  return log(menuDate, 'removeMenu');
}

function getLogs({ startDate, endDate, menuDate }) {
  startDate = Moment.parseZone(startDate || 0).utc();
  endDate = Moment.parseZone(endDate || Date.now()).utc();

  if (menuDate) {
    return MenuLog.find({
      logDate: { $gte: startDate, $lte: endDate },
      menuDate,
    }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
  }

  return MenuLog.find({
    logDate: { $gte: startDate, $lte: endDate },
  }).then(arr => arr.sort((first, second) => second.logDate.getTime() - first.logDate.getTime()));
}

export default {
  uploadMenu,
  publishMenu,
  disableDay,
  removeMenu,
  getLogs,
};
