function getYearAndMonthAndDayAsString() {
  let current = new Date();
  let year = current.getFullYear();
  let month = current.getMonth();
  let day = current.getDay();
  // 次の月に設定する
  let y_str = `${year}`;
  let ym_str = `${year}${month}`;
  let ymd_str = `${year}${month}${day}`;

  return [y_str, ym_str, ymd_str];
}

[y_str, ym_str, ymd_str] = getYearAndMonthAndDayAsString();

console.log(y_str);
console.log(ym_str);
console.log(ymd_str);

