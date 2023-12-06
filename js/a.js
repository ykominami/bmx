let str = undefined;

console.log(str);

if (str === undefined) {
  console.log("1");
} else {
  console.log("2");
}

let b = {};
console.log(typeof b);
if (typeof b === "object") {
  console.log("A");
} else {
  console.log("B");
}
// c = "c";
c = b;
console.log(typeof c);
if (typeof c === "string") {
  console.log("C");
} else {
  console.log("D");
}
