# Study Content Migration Scripts

Scripts to migrate legacy Tanium TCO Module_Guide content to the modern-tco Supabase database.

## Overview

These scripts handle the complete migration of study content from the legacy Tanium TCO application to the modern-tco app with Supabase backend. The migration includes:

- **Domain Name Mapping**: Converts legacy domain names to official TCO blueprint names
- **Markdown Parsing**: Extracts structured content from Module_Guide markdown files
- **Database Import**: Inserts parsed content into Supabase study content tables
- **Progress Tracking**: Provides detailed logging and verification of migration results

## Files

- `migrate-study-content.js` - Main migration script
- `test-content-parser.js` - Test script for content parsing (no database operations)
- `package.json` - Dependencies and npm scripts
- `.env.example` - Environment variables template
- `README.md` - This documentation

## Setup

1. **Install Dependencies**

   ```bash
   cd scripts
   npm install
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Environment Variables Required**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Usage

### Test Content Parsing (Safe - No Database Operations)

```bash
npm run test-parser
```

This will:

- Parse all Module_Guide markdown files
- Display section structure and statistics
- Test domain name mapping
- Show content previews
- Verify all files are accessible

### Run Complete Migration

```bash
npm run migrate
```

This will:

- Parse all 5 legacy Module_Guide files
- Apply domain name mapping (legacy → modern TCO blueprint names)
- Create study_modules entries in Supabase
- Create study_sections entries with structured content
- Verify migration results
- Display comprehensive statistics

### Verify Existing Migration

```bash
npm run verify
```

## Domain Name Mapping

The migration handles domain name changes between legacy and modern TCO blueprint:

| Legacy Domain                       | Modern TCO Blueprint            |
| ----------------------------------- | ------------------------------- |
| Asking Questions                    | Asking Questions                |
| Refining Questions and Targeting    | Refining Questions              |
| Taking Action                       | Taking Action                   |
| Tanium Navigation and Basic Modules | Navigation & Basic Modules      |
| Report Generation and Data Export   | Report Generation & Data Export |

## File Mapping

| Modern Domain                   | Legacy File                               |
| ------------------------------- | ----------------------------------------- |
| Asking Questions                | 01-Asking_Questions.md                    |
| Refining Questions              | 02-Refining_Questions_and_Targeting.md    |
| Taking Action                   | 03-Taking_Action.md                       |
| Navigation & Basic Modules      | 04-Tanium_Navigation_and_Basic_Modules.md |
| Report Generation & Data Export | 05-Report_Generation_and_Data_Export.md   |

## Database Schema

The migration creates content in these Supabase tables:

### study_modules

- `id` (UUID, Primary Key)
- `domain` (Text) - Modern TCO blueprint domain name
- `title` (Text) - Display title for the study module
- `description` (Text) - Module description
- `total_sections` (Integer) - Number of sections in this module
- `estimated_time_minutes` (Integer) - Estimated study time
- `difficulty_level` (Text) - Always 'intermediate'
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### study_sections

- `id` (UUID, Primary Key)
- `module_id` (UUID, Foreign Key to study_modules)
- `title` (Text) - Section title from markdown headers
- `content` (Text) - Section content (markdown preserved)
- `order_index` (Decimal) - Sort order within module
- `parent_section_id` (UUID, nullable) - For subsection hierarchy
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Content Structure

The parser handles markdown structure as follows:

- `## Section Headers` → Main study_sections entries
- `### Subsection Headers` → Child study_sections entries with parent_section_id
- Content between headers → Stored in section.content (preserves formatting)
- Order preserved via order_index (decimals for subsections)

## Error Handling

The migration script includes comprehensive error handling:

- **File Not Found**: Skips missing files, continues with others
- **Database Errors**: Detailed error messages with context
- **Parsing Errors**: Continues processing other sections/files
- **Environment Issues**: Clear messages for missing credentials
- **Verification**: Post-migration validation ensures data integrity

## Output Example

```
🚀 Starting Study Content Migration
==================================

📚 Migrating Asking Questions → Asking Questions
   📖 Read 18,234 characters from 01-Asking_Questions.md
   📝 Parsed 8 sections
   ✅ Created study module: 550e8400-e29b-41d4-a716-446655440000
   ✅ Created 15 study sections

📚 Migrating Refining Questions and Targeting → Refining Questions
   📖 Read 22,156 characters from 02-Refining_Questions_and_Targeting.md
   📝 Parsed 6 sections
   ✅ Created study module: 550e8400-e29b-41d4-a716-446655440001
   ✅ Created 12 study sections

📊 Migration Summary
==================
Domains migrated: 5/5
Total sections: 67
Total content: 104,532 characters
  • Asking Questions: 15 sections (18,234 chars)
  • Refining Questions: 12 sections (22,156 chars)
  • Taking Action: 14 sections (21,445 chars)
  • Navigation & Basic Modules: 13 sections (20,123 chars)
  • Report Generation & Data Export: 13 sections (22,574 chars)

🔍 Verifying Migration
=====================
✅ Found 5 study modules:
   • Asking Questions (8 sections, 120min)
   • Refining Questions (6 sections, 90min)
   • Taking Action (7 sections, 105min)
   • Navigation & Basic Modules (6 sections, 90min)
   • Report Generation & Data Export (6 sections, 90min)
✅ Found 67 study sections total

🎉 Migration completed successfully!
```

## Integration with Modern-TCO App

After migration, the study content will be available in the modern-tco app through:

1. **Study Content API**: React components can fetch content via Supabase client
2. **Progress Tracking**: User study progress stored in user_study_progress table
3. **Bookmarking**: User bookmarks stored in user_study_bookmarks table
4. **Study Mode**: Navigate study content before practice questions
5. **Domain Integration**: Content accessible via existing domain selection

## Troubleshooting

### Permission Issues

- Ensure SUPABASE_SERVICE_ROLE_KEY has full database access
- Check Row Level Security policies are properly configured

### File Path Issues

- Verify legacy Module_Guide files exist in `../../docs/Module_Guides/`
- Check file names match exactly (case sensitive)

### Database Connection Issues

- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Test connection with Supabase dashboard
- Check network connectivity

### Content Parsing Issues

- Run `npm run test-parser` to isolate parsing problems
- Check markdown formatting in source files
- Verify section headers use `##` and `###` format

## Development

To modify the migration logic:

1. Edit `migrate-study-content.js` for database operations
2. Edit `test-content-parser.js` for parsing tests
3. Test changes with `npm run test-parser` first
4. Run small migrations with subset of files for validation
5. Always backup database before running full migration
