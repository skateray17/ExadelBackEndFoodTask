import XLSX from 'xlsx';
import Menu from '../models/Menu';

export default {
  addMenu,// eslint-disable-line
  getActualMenus,// eslint-disable-line
  getMenuByDate,// eslint-disable-line
  getCommonByDate,// eslint-disable-line
  markOrder,// eslint-disable-line
  publishMenu,// eslint-disable-line
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
const fileError = {
  message: 'file error',
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
  let day = (date.getDate() - date.getDay()) + 1;
  if (date.getDay() === 0) {
    day -= 7;
  }
  day = addZero(day);
  let month = addZero(date.getMonth() + 1);
  let dateString = `${day}.${month}.${date.getFullYear()}-`;
  date.setDate((date.getDate() - date.getDay()) + 7);
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
  date.setDate((date.getDate() - date.getDay()) + 8);
  const date2 = getStringDate(date);
  const MENUS = [];
  return Promise.all([Menu.findOne(({ date: date1 })), Menu.findOne(({ date: date2 }))])
    .then((results) => {
      if (results[0]) {
        MENUS[0] = results[0].menu;
      }
      if (results[1]) {
        MENUS[1] = results[1].menu;
      }
      actualMenus = MENUS;
      return MENUS;
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

function addMenu(body) {
  try {
    let book = XLSX.read(body);
    book = book.Sheets[book.SheetNames[0]];
    const MENU = makeMenu(book);
    if (validateMenu(MENU)) {
      MENU.published = false;
      Menu.findOneAndUpdate(
        { date: MENU.date },
        { menu: MENU },
        { upsert: true },
      )
        .then(() => {
          updateCachedMenu();
        });
      return Promise.resolve(MENU);
    }
    return Promise.reject(fileError);
  } catch (e) {
    return Promise.reject(fileError);
  }
}

function publishMenu(date) {
  return Menu.update(
    { date },
    { $set: { 'menu.published': true } },
  )
    .then((el) => {
      if (!el) {
        return Promise.reject();
      }
      updateCachedMenu();
      return Promise.resolve();
    });
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
function markDayInMenu(MENU, date) {
  Object.keys(MENU.menu).forEach((e) => {
    const menuOnDate = MENU.menu[e];
    if (menuOnDate.day && compareDates(new Date(menuOnDate.day), new Date(date))) {
      menuOnDate.available = false;
      const m = MENU.menu;
      m[e] = menuOnDate;
      Menu.findOneAndUpdate(
        { date: MENU.date },
        { $set: { menu: m } },
      ).then(() => {
        updateCachedMenu();
      });
    }
  });
}

function markOrder() {
  const date = new Date();
  return Menu.find()
    .then((MENUS) => {
      MENUS.forEach((el) => {
        markDayInMenu(el, date);
      });
    });
}

updateCachedMenu();
