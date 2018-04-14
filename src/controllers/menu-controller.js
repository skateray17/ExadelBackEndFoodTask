import XLSX from 'xlsx';
import Menu from '../models/Menu';

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
function validateDayItem(dayItem) {
  return dayItem.some((el) => {
    if (el.name && el.cost && typeof el.name === 'string' && typeof el.cost === 'number') {
      return false;
    }
    return true;
  });
}
function validateMenuItem(menuItem) {
  if (Object.keys(menuItem).some((e) => {
    const dayItem = menuItem[e];
    if (dayItem instanceof Date) {
      return false;
    }
    return validateDayItem(dayItem);
  })) {
    return true;
  }
  return false;
}
function getStringDate(d) {
  const date = new Date(d);
  let day = date.getDate() - date.getDay();
  day += 1;
  if (date.getDay() === 0) {
    day -= 7;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let dateString = `${day}.${month}.${date.getFullYear()}-`;
  date.setDate((date.getDate() - date.getDay()) + 7);
  day = date.getDate();
  if (day < 10) {
    day = `0${day}`;
  }
  month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  dateString += `${day}.${month}.${date.getFullYear()}`;
  return dateString;
}
export default {
  validateMenu(menu) {
    return typeof menu.date === 'string' && !Object.keys(menu).some((el) => {
      const menuItem = menu[el];
      if (typeof menuItem === 'string') {
        return false;
      }
      if (menuItem) {
        return validateMenuItem(menuItem);
      }
      return true;
    });
  },
  addMenu(body) {
    try {
      let book = XLSX.read(body);
      book = book.Sheets[book.SheetNames[0]];
      const MENU = {};
      let currentDate;
      let date;
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
      return Menu.findOne(({ date: MENU.date }))
        .then((menu) => {
          if (menu) {
            return {
              status: 506,
              body: { message: 'menu is already exists' },
            };
          } else if (this.validateMenu(MENU)) {
            const m = new Menu({
              date: MENU.date,
              menu: MENU,
            });
            m.save();
            return {
              status: 200,
              body: MENU,
            };
          }
          return {
            status: 506,
            body: { message: 'file error' },
          };
        });
    } catch (e) {
      return new Promise((res) => {
        res({
          status: 506,
          body: { message: 'file error' },
        });
      });
    }
  },
  getMenu() {
    const date = new Date();
    const date1 = getStringDate(date);
    date.setDate((date.getDate() - date.getDay()) + 8);
    const date2 = getStringDate(date);
    const MENUS = [];
    return Promise.all([Menu.findOne(({ date: date1 })), Menu.findOne(({ date: date2 }))])
      .then((results) => {
        if (results[0]) {
          MENUS.push(results[0]);
        }
        if (results[1]) {
          MENUS.push(results[1]);
        }
        return {
          status: 200,
          body: MENUS,
        };
      });
  },
};
