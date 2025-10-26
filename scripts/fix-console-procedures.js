const fs = require("fs");

const filePath =
  "C:\\Users\\robne\\Documents\\mapmydeals-gpt5\\Tanium TCO\\modern-tco\\src\\data\\imported-questions-master.ts";

// Read the file
let content = fs.readFileSync(filePath, "utf8");

// Replace Console Procedures string literals
content = content.replace(
  /"category": "Console Procedures",/g,
  '"category": QuestionCategory.CONSOLE_PROCEDURES,'
);

// Write back to file
fs.writeFileSync(filePath, content, "utf8");

console.log("Fixed Console Procedures category strings");
