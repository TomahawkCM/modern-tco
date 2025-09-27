// Test script to verify MDX loader functionality
const { loadModuleBySlug, getAllModuleMetadata } = require("./src/lib/mdx/module-loader.ts");

async function testMDXLoader() {
  console.log("🧪 Testing MDX Loader...");

  try {
    // Test 1: Load all module metadata
    console.log("\n1. Testing getAllModuleMetadata...");
    const allModules = await getAllModuleMetadata();
    console.log(`✅ Found ${allModules.length} modules:`);
    allModules.forEach((module) => {
      console.log(`   - ${module.slug}: ${module.frontmatter.title}`);
    });

    // Test 2: Load specific module
    console.log("\n2. Testing loadModuleBySlug...");
    const testModule = await loadModuleBySlug("01-asking-questions");
    if (testModule) {
      console.log(`✅ Loaded module: ${testModule.frontmatter.title}`);
      console.log(`   - Domain: ${testModule.frontmatter.domainEnum}`);
      console.log(`   - Difficulty: ${testModule.frontmatter.difficulty}`);
      console.log(`   - Estimated Time: ${testModule.frontmatter.estimatedTime}`);
      console.log(`   - Has content: ${testModule.content ? "Yes" : "No"}`);
      console.log(`   - Content type: ${typeof testModule.content}`);
    } else {
      console.log("❌ Failed to load test module");
    }
  } catch (error) {
    console.error("❌ Error testing MDX loader:", error.message);
    console.error("Stack:", error.stack);
  }
}

testMDXLoader();
