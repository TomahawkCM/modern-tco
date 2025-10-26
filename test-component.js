// Simple test to check if CyberpunkStudyCard component can be imported
try {
  const fs = require('fs');
  const path = require('path');
  
  // Read the component file
  const componentPath = path.join(__dirname, 'src', 'components', 'study', 'CyberpunkStudyCard.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  
  // Basic syntax checks
  const hasExport = componentContent.includes('export { CyberpunkStudyCard }');
  const hasComponent = componentContent.includes('const CyberpunkStudyCard');
  const hasUseClient = componentContent.includes('"use client"');
  const hasImports = componentContent.includes('import * as React');
  
  console.log('Component Analysis:');
  console.log('- Has "use client":', hasUseClient);
  console.log('- Has imports:', hasImports);
  console.log('- Has component definition:', hasComponent);
  console.log('- Has export:', hasExport);
  
  // Check for potential syntax issues
  const openBraces = (componentContent.match(/\{/g) || []).length;
  const closeBraces = (componentContent.match(/\}/g) || []).length;
  const openParens = (componentContent.match(/\(/g) || []).length;
  const closeParens = (componentContent.match(/\)/g) || []).length;
  
  console.log('\nSyntax Check:');
  console.log('- Open braces:', openBraces);
  console.log('- Close braces:', closeBraces);
  console.log('- Braces balanced:', openBraces === closeBraces);
  console.log('- Open parens:', openParens);
  console.log('- Close parens:', closeParens);
  console.log('- Parens balanced:', openParens === closeParens);
  
  if (openBraces === closeBraces && openParens === closeParens && hasExport && hasComponent) {
    console.log('\n✅ Component appears to be syntactically correct!');
  } else {
    console.log('\n❌ Component may have syntax issues');
  }
  
} catch (error) {
  console.error('Error testing component:', error.message);
}