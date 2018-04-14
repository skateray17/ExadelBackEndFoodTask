import XLSX from 'xlsx';
import Menu from '../models/Menu';

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

export default {
  validateMenu(menu) {
    return Boolean(typeof menu.date === 'string' && !Object.keys(menu).find((el) => {
      if (typeof menu[el] === 'string') {
        return false;
      }
      if (menu[el]) {
        if (Object.keys(menu[el]).find((e) => {
          if (menu[el][e] instanceof Date) {
            return false;
          }
          return Boolean(menu[el][e].find((ee) => {
            if (ee.name && ee.cost) {
              return false;
            }
            return true;
          }));
        })) {
          return true;
        }
        return false;
      }
      return true;
    }));
  },
  addMenu(body, callback) {
    try {
      let book = XLSX.read(body);
      book = book.Sheets[book.SheetNames[0]];
      const MENU = {};
      let currentDate;
      let date;
      Object.keys(book).forEach((el) => {
        if (el === 'B1') {
          MENU.date = book[el].v;
          date = MENU.date.split('-')[0].split('.');
        }
        if (el.startsWith('A') && el !== 'A1') {
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
          if (el.startsWith('B')) {
            MENU[currentDate].menu.push({ name: book[el].v });
          } else if (el.startsWith('C')) {
            MENU[currentDate].menu[MENU[currentDate].menu.length - 1].weight = book[el].v;
          } else if (el.startsWith('D')) {
            MENU[currentDate].menu[MENU[currentDate].menu.length - 1].cost = book[el].v;
          }
        }
      });
      Menu.findOne(({ date: MENU.date }), (err, menu) => {
        if (menu) {
          callback(506, { message: 'menu is already exists' });
        } else if (this.validateMenu(MENU)) {
          const m = new Menu({
            date: MENU.date,
            menu: MENU,
          });
          m.save();
          callback(200, MENU);
        } else {
          callback(506, { message: 'file error' });
        }
      });
    } catch (e) {
      callback(506, { message: 'file error' });
    }
  },
};
