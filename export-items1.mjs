import { writeFile } from "node:fs/promises";
import { items1 } from "./config/settings2.js";

await writeFile(
  "./items1.json",
  JSON.stringify(items1, null, 2),
  "utf-8"
);

console.log("items1.json を出力しました");