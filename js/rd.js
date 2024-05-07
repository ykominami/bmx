const array = ['Day', '2023', '202311', '20231125'];

let result = array.reduce((accumulator, currentValue) => {
    console.log(accumulator);
    console.log(currentValue);
    console.log('==');
    return [accumulator, currentValue].join('/');
});

console.log(result);
