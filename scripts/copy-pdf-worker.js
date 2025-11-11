const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build');
const targets = [
  {
    description: 'PDF.js worker',
    sources: ['pdf.worker.min.mjs', 'pdf.worker.mjs'],
    destination: path.resolve(__dirname, '../public/pdf.worker.mjs'),
  },
  {
    description: 'PDF.js main bundle',
    sources: ['pdf.min.mjs', 'pdf.mjs'],
    destination: path.resolve(__dirname, '../public/pdf.mjs'),
  },
];

for (const target of targets) {
  const sourcePath = target.sources
    .map((file) => path.join(sourceDir, file))
    .find((candidate) => fs.existsSync(candidate));

  if (!sourcePath) {
    console.error(
      `❌ Error: Could not find any of [${target.sources.join(', ')}] in ${sourceDir}.`
    );
    console.error('Please run `npm install` again.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(target.destination), { recursive: true });
  fs.copyFileSync(sourcePath, target.destination);
  // eslint-disable-next-line no-console
  console.log(
    `✅ Copied ${path.basename(sourcePath)} → ${path.relative(process.cwd(), target.destination)} (${target.description}).`
  );
}
