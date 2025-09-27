const fs = require("fs");
const path = require("path");

// File path
const filePath = path.join(__dirname, "..", "src", "data", "imported-questions-master.ts");

console.log("Starting enum literal fixes...");

// Read the file
let content = fs.readFileSync(filePath, "utf8");
console.log(`File size: ${content.length} characters`);

// Count original occurrences
const difficultyBeginner = (content.match(/"difficulty": "Beginner",/g) || []).length;
const difficultyIntermediate = (content.match(/"difficulty": "Intermediate",/g) || []).length;
const difficultyAdvanced = (content.match(/"difficulty": "Advanced",/g) || []).length;

const categoryPlatform = (content.match(/"category": "Platform Fundamentals",/g) || []).length;
const categoryConsole = (content.match(/"category": "Console Procedures",/g) || []).length;
const categoryTroubleshooting = (content.match(/"category": "Troubleshooting",/g) || []).length;
const categoryPractical = (content.match(/"category": "Practical Scenarios",/g) || []).length;
const categoryLinear = (content.match(/"category": "Linear Chain Architecture",/g) || []).length;

console.log(
  `Found difficulty strings: Beginner(${difficultyBeginner}), Intermediate(${difficultyIntermediate}), Advanced(${difficultyAdvanced})`
);
console.log(
  `Found category strings: Platform(${categoryPlatform}), Console(${categoryConsole}), Troubleshooting(${categoryTroubleshooting}), Practical(${categoryPractical}), Linear(${categoryLinear})`
);

// Replace difficulty strings
content = content.replace(/"difficulty": "Beginner",/g, '"difficulty": Difficulty.BEGINNER,');
content = content.replace(
  /"difficulty": "Intermediate",/g,
  '"difficulty": Difficulty.INTERMEDIATE,'
);
content = content.replace(/"difficulty": "Advanced",/g, '"difficulty": Difficulty.ADVANCED,');

// Replace category strings
content = content.replace(
  /"category": "Platform Fundamentals",/g,
  '"category": QuestionCategory.PLATFORM_FUNDAMENTALS,'
);
content = content.replace(
  /"category": "Console Procedures",/g,
  '"category": QuestionCategory.CONSOLE_PROCEDURES,'
);
content = content.replace(
  /"category": "Troubleshooting",/g,
  '"category": QuestionCategory.TROUBLESHOOTING,'
);
content = content.replace(
  /"category": "Practical Scenarios",/g,
  '"category": QuestionCategory.PRACTICAL_SCENARIOS,'
);
content = content.replace(
  /"category": "Linear Chain Architecture",/g,
  '"category": QuestionCategory.LINEAR_CHAIN,'
);

// Write the file back
fs.writeFileSync(filePath, content, "utf8");

console.log("Enum literal fixes completed!");

// Verify changes
const newContent = fs.readFileSync(filePath, "utf8");
const remainingDifficultyStrings = (newContent.match(/"difficulty": "[^"]*",/g) || []).length;
const remainingCategoryStrings = (newContent.match(/"category": "[^"]*",/g) || []).length;

console.log(`Remaining difficulty strings: ${remainingDifficultyStrings}`);
console.log(`Remaining category strings: ${remainingCategoryStrings}`);

if (remainingDifficultyStrings === 0 && remainingCategoryStrings === 0) {
  console.log("✅ All enum conversions completed successfully!");
} else {
  console.log("⚠️ Some string literals may still remain");
}
