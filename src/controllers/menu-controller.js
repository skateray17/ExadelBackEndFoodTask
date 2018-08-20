import XLSX from 'xlsx';
import Menu from '../models/Menu';
import MenuLogController from '../controllers/menu-log-controller';

export default {
  addMenu,// eslint-disable-line
  getActualMenus,// eslint-disable-line
  getMenuByDate,// eslint-disable-line
  getCommonByDate,// eslint-disable-line
  setOrderAvailability,// eslint-disable-line
  publishMenu,// eslint-disable-line
  removeMenuByDateAndVendor,// eslint-disable-line
  updateCachedMenu,// eslint-disable-line
};

let actualMenus = [];
const XLSXDatePlace = 'B1';
const XLSXDayWord = 'A1';
const XLSXDay = 'A';
const XLSXFoodName = 'B';
const XLSXFoodWeight = 'C';
const XLSXFoodCost = 'D';
const Translate = {
  пн: 'mon',
  вт: 'tue',
  ср: 'wed',
  чт: 'thu',
  пт: 'fri',
  сб: 'sat',
  особое: 'common',
};
const Day = {
  mon: '0',
  tue: '1',
  wed: '2',
  thu: '3',
  fri: '4',
  sat: '5',
};
const unDay = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const fileError = {
  message: 'file error',
};
const dateError = {
  message: 'date error',
};

/**
 * functions for working with Dates
 */
function compareDates(date1, date2) {
  if (date1.getDate() === date2.getDate() && date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()) {
    return true;
  }
  return false;
}

function addZero(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return num;
}

function getStringDate(d) {
  const date = new Date(d);
  date.setDate((date.getDate() - (date.getDay() ? date.getDay() : 7)) + 1);
  let day = addZero(date.getDate());
  let month = addZero(date.getMonth() + 1);
  let dateString = `${day}.${month}.${date.getFullYear()}-`;
  date.setDate(date.getDate() + 6);
  day = date.getDate();
  day = addZero(day);
  month = addZero(date.getMonth() + 1);
  dateString += `${day}.${month}.${date.getFullYear()}`;
  return dateString;
}

/**
 * functions for validating new Menu
 */
function validateFood(el) {
  return el.name && el.cost && typeof el.name === 'string' && typeof el.cost === 'number';
}

function validateDayItem(dayItem) {
  return dayItem.some(el => !validateFood(el));
}

function validateMenuItem(menuItem) {
  if (Object.keys(menuItem).some((e) => {
    const dayItem = menuItem[e];
    if (dayItem instanceof Date || e === 'available') {
      return false;
    }
    return validateDayItem(dayItem);
  })) {
    return true;
  }
  return false;
}

function validateMenu(menu) {
  return typeof menu.date === 'string' && !Object.keys(menu).some((el) => {
    const menuItem = menu[el];
    if (el === 'date') {
      return false;
    }
    if (menuItem) {
      return validateMenuItem(menuItem);
    }
    return true;
  });
}

/**
 * functions for working with Cached Menus
 */
function getActualMenus() {
  return actualMenus;
}

function updateCachedMenu() {
  const date = new Date();
  const date1 = getStringDate(date);
  date.setDate((date.getDate() - (date.getDay() ? date.getDay() : 7)) + 8);
  const date2 = getStringDate(date);
  return Promise.all([Menu.find(({ date: date1 })), Menu.find(({ date: date2 }))])
    .then((results) => {
      actualMenus = results;
      return results;
    });
}

/**
 * functions for adding new Menu
 */
function makeMenu(book) {
  let date;
  let currentDate;
  const MENU = {};
  Object.keys(book).forEach((el) => {
    if (el === XLSXDatePlace) {
      MENU.date = book[el].v;
      date = MENU.date.split('-')[0].split('.');
    }
    if (el.startsWith(XLSXDay) && el !== XLSXDayWord) {
      currentDate = Translate[book[el].v];
      if (+date[0] + +Day[currentDate]) {
        MENU[currentDate] = {
          day: new Date(date[2], date[1] - 1, +date[0] + +Day[currentDate]),
          available: true,
          menu: [],
        };
      } else {
        MENU[currentDate] = {
          menu: [],
        };
      }
    } else if (currentDate) {
      const menuOnDate = MENU[currentDate];
      const index = menuOnDate.menu.length - 1;
      if (el.startsWith(XLSXFoodName)) {
        menuOnDate.menu.push({ name: book[el].v });
      } else if (el.startsWith(XLSXFoodWeight)) {
        menuOnDate.menu[index].weight = book[el].v;
      } else if (el.startsWith(XLSXFoodCost)) {
        menuOnDate.menu[index].cost = book[el].v;
      }
    }
  });
  return MENU;
}

function addMenu(file, date, vendorName) {
  try {
    let book = XLSX.read(file);
    book = book.Sheets[book.SheetNames[0]];
    const MENU = makeMenu(book);
    let dateString;
    const today = new Date();
    if (date === 'current') {
      dateString = getStringDate(today);
    } else if (date === 'next') {
      dateString = getStringDate(new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
      ));
    }
    if (dateString !== MENU.date) {
      return Promise.reject(dateError);
    }
    if (validateMenu(MENU)) {
      MENU.published = false;
      return Menu.findOneAndUpdate(
        { date: MENU.date, vendorName },
        { menu: MENU },
        { upsert: true },
      )
        .then(() => updateCachedMenu())
        .then(() => MenuLogController.uploadMenu(MENU.date, vendorName))
        .then(() => MENU);
    }
    return Promise.reject(fileError);
  } catch (e) {
    return Promise.reject(fileError);
  }
}

function publishMenu({ date, published, vendorName }) {
  return Menu.update(
    { date, vendorName },
    { $set: { 'menu.published': published } },
  )
    .then((el) => {
      if (!el) {
        return Promise.reject();
      }
      updateCachedMenu();
      return Promise.resolve();
    })
    .then(() => MenuLogController.publishMenu(date, vendorName));
}

/**
 * special functions for Orders Services
 */
function getMenuByDate(date) {
  let menu;
  actualMenus.forEach((MENU) => {
    Object.keys(MENU).forEach((el) => {
      const menuOnDay = MENU[el];
      if (menuOnDay.day && compareDates(new Date(menuOnDay.day), new Date(date))) {
        menu = menuOnDay.menu;// eslint-disable-line
      }
    });
  });
  return menu;
}

function getCommonByDate(date) {
  let common;
  let flag = false;
  actualMenus.forEach((MENU) => {
    Object.keys(MENU).forEach((el) => {
      if (el !== 'date') {
        const menuOnDay = MENU[el];
        if (menuOnDay.day && compareDates(new Date(menuOnDay.day), new Date(date))) {
          flag = true;
        }
        if (flag && el === 'common') {
          common = menuOnDay.menu;
          flag = false;
        }
      }
    });
  });
  return common;
}

/**
 * functions for deactivating today's Menu
 */

function setOrderAvailability(isAvailable) {
  const date = new Date();
  const stringDate = getStringDate(date);
  return Menu.find({
    date: stringDate,
  })
    .then((MENUS) => {
      const setOrderAvailabilityPromises = [];
      if (MENUS.length) {
        MENUS.forEach((MENU) => {
          const { menu, _id } = MENU;
          const day = unDay[date.getDay() - 1];
          menu[day].available = isAvailable;
          setOrderAvailabilityPromises.push(Menu.findByIdAndUpdate(_id, { $set: { menu } }));
        });
        return Promise.all(setOrderAvailabilityPromises);
      }
      return Promise.reject();
    })
    .then(() => MenuLogController.disableDay(stringDate, 'ALL'))
    .then(updateCachedMenu);
}

function removeMenuByDateAndVendor(weekDuration, vendorName) {
  return Menu.remove({ date: weekDuration, vendorName })
    .then(() => (Promise.resolve()))
    .then(() => MenuLogController.removeMenu(weekDuration, vendorName))
    .catch(() => (Promise.reject()));
}

updateCachedMenu();
