import MenuLog from '../models/MenuLog';
import Messages from '../models/Messages';

function log(menuDate, message) {
  return new MenuLog({
    menuDate,
    message,
    logDate: Math.floor(Date.now()),
  }).save();
}

function uploadMenu(menuDate) {
  return log(menuDate, Messages.uploadMenu);
}
function publishMenu(menuDate) {
  return log(menuDate, Messages.publishMenu);
}
function disableDay(menuDate) {
  return log(menuDate, Messages.disableDay);
}
function removeMenu(menuDate) {
  return log(menuDate, Messages.removeMenu);
}


export default {
  uploadMenu,
  publishMenu,
  disableDay,
  removeMenu,
};
