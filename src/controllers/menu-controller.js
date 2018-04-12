import XLSX from 'xlsx';

export default {
  addMenu(body) {
    let book = XLSX.read(body);
    book = book.Sheets[book.SheetNames[0]];
    const MENU = {};
    let currentDate;
    Object.keys(book).forEach((el) => {
      if (el.startsWith('A')) {
        currentDate = book[el].v;
        MENU[currentDate] = [];
      } else if (currentDate) {
        if (el.startsWith('B')) {
          MENU[currentDate].push({ name: book[el].v });
        } else if (el.startsWith('C')) {
          MENU[currentDate][MENU[currentDate].length - 1].weight = book[el].v;
        } else if (el.startsWith('D')) {
          MENU[currentDate][MENU[currentDate].length - 1].cost = book[el].v;
        }
      }
    });
    return MENU;
  },
};
