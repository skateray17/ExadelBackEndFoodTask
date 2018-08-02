import MenuLog from '../models/MenuLog';
import Messages from '../models/Messages';

function constructMessage(msg) {
  return { message: msg, logDate: Math.floor(Date.now()) };
}
function log(menuDate, message) {
  return MenuLog.update(
    { menuDate },
    {
      $set: {
        menuDate,
      },
      $push: { logs: constructMessage(message) },

    },
    { new: true, upsert: true },
  );
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
