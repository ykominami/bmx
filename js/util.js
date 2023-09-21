/*
function adjustMonth(month) {
  if (month > 12) {
    month = 1;
  }
  return month;
}

function getNextMonth(month) {
  return adjustMonth(month + 1);
}
*/
function getMonthx(datex) {
  return datex.getMonth() + 1;
}

function adjustAsStr(num) {
  let str = `${num}`;
  if (num < 10) {
    str = `0${num}`;
  }
  return str;
}
