const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function convertIcon(svgPath, pngPath, size) {
  try {
    await sharp(svgPath).resize(size, size).png().toFile(pngPath);
    console.log(`✅ Created ${path.basename(pngPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${svgPath}:`, error.message);
  }
}

async function main() {
  const iconsDir = path.join(__dirname, "../public/icons");

  // Convert main app icons
  await convertIcon(
    path.join(iconsDir, "budget-app-192.svg"),
    path.join(iconsDir, "budget-app-192.png"),
    192
  );

  await convertIcon(
    path.join(iconsDir, "budget-app-512.svg"),
    path.join(iconsDir, "budget-app-512.png"),
    512
  );

  console.log("\n✨ Icon conversion complete!");
}

main().catch(console.error);
