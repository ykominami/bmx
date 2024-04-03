import { debugPrint2, debugPrint } from './debug.js';

const array = ['Day', '2023', '202311', '20231125'];

let result = array.reduce((accumulator, currentValue, currentIndex, array) => {
  debugPrint2(accumulator);
  debugPrint2(currentValue);
  debugPrint2('==');
  return [accumulator, currentValue].join('/');
});

debugPrint2(result);
