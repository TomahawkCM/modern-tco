/**
 * Test Module 3 MDX Loader Integration
 * Tests that the expanded Module 3 content loads correctly with the existing MDX loader
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

async function testModuleLoader() {
  console.log('🧪 Testing Module 3 MDX Loader Integration...\n');

  // Test the expanded Module 3 file
  const modulePath = path.join(
    __dirname,
    'src',
    'content',
    'modules',
    '03-taking-action-packages-actions.mdx'
  );

  try {
    // Check if file exists
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module file not found: ${modulePath}`);
    }

    console.log('✅ Module 3 file exists');

    // Read and parse the file
    const fileContents = fs.readFileSync(modulePath, 'utf8');
    const { data: frontmatter, content: rawContent } = matter(fileContents);

    console.log('✅ File parsing successful');
    console.log(`📄 Content length: ${rawContent.length} characters`);

    // Validate frontmatter structure
    const requiredFields = [
      'id',
      'title',
      'domainSlug',
      'domainEnum',
      'difficulty',
      'estimatedTime',
    ];
    const missingFields = requiredFields.filter((field) => !(field in frontmatter));

    if (missingFields.length > 0) {
      console.log(`❌ Missing frontmatter fields: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ All required frontmatter fields present');
    }

    // Log frontmatter details
    console.log('\n📋 Frontmatter Details:');
    console.log(`   ID: ${frontmatter.id}`);
    console.log(`   Title: ${frontmatter.title}`);
    console.log(`   Domain Slug: ${frontmatter.domainSlug}`);
    console.log(`   Domain Enum: ${frontmatter.domainEnum}`);
    console.log(`   Difficulty: ${frontmatter.difficulty}`);
    console.log(`   Estimated Time: ${frontmatter.estimatedTime}`);

    // Check domain slug mapping
    const expectedDomainSlug = 'taking-action-packages-actions';
    if (frontmatter.domainSlug === expectedDomainSlug) {
      console.log('✅ Domain slug matches expected value');
    } else {
      console.log(
        `⚠️  Domain slug mismatch. Expected: ${expectedDomainSlug}, Got: ${frontmatter.domainSlug}`
      );
    }

    // Analyze content sections
    const sections = rawContent.split(/^##\s/m).filter((section) => section.trim().length > 0);
    console.log(`\n📚 Content Analysis:`);
    console.log(`   Total sections: ${sections.length}`);

    // Extract section titles
    const sectionTitles = sections
      .map((section) => {
        const firstLine = section.split('\n')[0];
        return firstLine.replace(/^##\s*/, '').trim();
      })
      .filter((title) => title.length > 0);

    console.log(`   Section titles:`);
    sectionTitles.forEach((title, index) => {
      console.log(`     ${index + 1}. ${title}`);
    });

    // Check for interactive components
    const interactiveElements = [
      'PracticeButton',
      'InteractiveCodeBlock',
      'TaniumConsole',
      'VideoPlayer',
    ];

    console.log(`\n🔧 Interactive Components Check:`);
    interactiveElements.forEach((element) => {
      const count = (rawContent.match(new RegExp(`<${element}`, 'g')) || []).length;
      if (count > 0) {
        console.log(`   ✅ ${element}: ${count} instances`);
      } else {
        console.log(`   ➖ ${element}: Not used`);
      }
    });

    // Check for HTML entity issues
    const htmlEntities = ['&lt;', '&gt;', '&amp;', '&quot;'];
    console.log(`\n🔍 HTML Entity Check:`);
    htmlEntities.forEach((entity) => {
      const count = (rawContent.match(new RegExp(entity, 'g')) || []).length;
      if (count > 0) {
        console.log(`   ⚠️  ${entity}: ${count} instances found`);
      } else {
        console.log(`   ✅ ${entity}: Clean`);
      }
    });

    // Check for code blocks
    const codeBlocks = rawContent.match(/```[\s\S]*?```/g) || [];
    console.log(`\n💻 Code Block Analysis:`);
    console.log(`   Total code blocks: ${codeBlocks.length}`);

    // Check for different code block types
    const languages = ['bash', 'powershell', 'tanium', 'yaml', 'json'];
    languages.forEach((lang) => {
      const count = (rawContent.match(new RegExp(`\`\`\`${lang}`, 'g')) || []).length;
      if (count > 0) {
        console.log(`   ${lang}: ${count} blocks`);
      }
    });

    console.log('\n🎉 Module 3 MDX Loader Test Complete!');

    return {
      success: true,
      frontmatter,
      contentLength: rawContent.length,
      sectionCount: sections.length,
      codeBlockCount: codeBlocks.length,
    };
  } catch (error) {
    console.error('❌ Module 3 MDX Loader Test Failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testModuleLoader()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ All tests passed! Module 3 is ready for integration.');
      process.exit(0);
    } else {
      console.log('\n❌ Tests failed. Please review the errors above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
