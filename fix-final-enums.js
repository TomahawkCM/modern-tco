const fs = require("fs");
const path = require("path");

console.log("Starting final enum literal fixes...");

const filePath = path.join(__dirname, "src", "data", "imported-questions-master.ts");
const backupPath = filePath + ".backup-final";

try {
  // Read the current file
  let content = fs.readFileSync(filePath, "utf8");

  // Create backup
  fs.writeFileSync(backupPath, content);
  console.log("Backup created:", backupPath);

  // Count occurrences before
  const beforeCount = (content.match(/"category": "Console Procedures",/g) || []).length;
  console.log(`Found ${beforeCount} "Console Procedures" strings to fix`);

  // Apply the replacement
  content = content.replace(
    /"category": "Console Procedures",/g,
    '"category": QuestionCategory.CONSOLE_PROCEDURES,'
  );

  // Count occurrences after
  const afterCount = (content.match(/"category": "Console Procedures",/g) || []).length;
  console.log(`Remaining "Console Procedures" strings: ${afterCount}`);
  console.log(`Fixed: ${beforeCount - afterCount} string literals`);

  // Write the fixed content
  fs.writeFileSync(filePath, content);
  console.log("File updated successfully!");

  // Verify the fix worked
  const verifyContent = fs.readFileSync(filePath, "utf8");
  const finalCount = (verifyContent.match(/"category": "Console Procedures",/g) || []).length;
  console.log(`Final verification: ${finalCount} remaining "Console Procedures" strings`);

  if (finalCount === 0) {
    console.log(
      '✅ SUCCESS: All "Console Procedures" string literals have been converted to enums!'
    );
  } else {
    console.log("⚠️  Some strings may still need conversion");
  }
} catch (error) {
  console.error("Error processing file:", error.message);
}
