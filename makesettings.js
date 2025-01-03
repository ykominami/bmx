const fs = require('fs');

const argv = process.argv;
let ofile = argv[2];
function make_content(num, count) {
  return `.g-${num}-${count} {
	grid-row-start: ${num};
	grid-row-end: ${num + 1};
	grid-column-start: ${count};
	grid-column-end: ${count + 1};
}
`;
}

const writable = fs.createWriteStream(ofile, { flags: 'w' });
const max_num = 140;
const max_count = 5;
for (let i = 1; i <= max_num; i++) {
  for (let j = 1; j <= max_count; j++) {
    let content = make_content(i, j);
    writable.write(content + '\n');
  }
}
writable.end();

// fs.writeFileSync( ofile, 'hello', 'utf-8', (err) => {
