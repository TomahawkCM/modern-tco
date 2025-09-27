# Module Seeding Enhancements

## Overview

The module seeding script has been enhanced with comprehensive CLI flags support for better control over the seeding process. This allows for targeted updates, testing without database modifications, and detailed output control.

## Enhanced Script Location

**Script**: `/scripts/seed-modules-from-mdx-enhanced.ts`
**Command**: `npm run content:seed:modules`

## Features

### 1. Dry Run Mode (`--dry-run`)

Preview what changes would be made without actually modifying the database. Perfect for:
- Testing new content before deployment
- Verifying MDX file parsing
- Reviewing database operations before execution

```bash
npm run content:seed:modules -- --dry-run
```

### 2. Domain-Specific Updates (`--replace-domain`)

Target specific domains for updates without affecting other content. Useful for:
- Updating content for a single certification domain
- Focused content releases
- Testing domain-specific changes

```bash
npm run content:seed:modules -- --replace-domain="Asking Questions"
npm run content:seed:modules -- --replace-domain="Taking Action"
```

Available domains:
- Asking Questions
- Refining Questions & Targeting
- Taking Action
- Navigation and Basic Module Functions
- Report Generation and Data Export

### 3. Verbose Output (`--verbose`)

Get detailed information about the seeding process including:
- Module descriptions and metadata
- Learning objectives count
- Exam weight percentages
- Estimated time for each module
- Section-by-section details

```bash
npm run content:seed:modules -- --verbose
```

### 4. Help Documentation (`--help`)

Display comprehensive usage information and examples:

```bash
npm run content:seed:modules -- --help
```

## Usage Examples

### Preview All Changes
```bash
npm run content:seed:modules -- --dry-run
```

### Update Specific Domain
```bash
npm run content:seed:modules -- --replace-domain="Refining Questions & Targeting"
```

### Dry Run with Verbose Output for Specific Domain
```bash
npm run content:seed:modules -- --replace-domain="Taking Action" --dry-run --verbose
```

### Production Update
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Run the seeding
npm run content:seed:modules
```

## Environment Requirements

The script requires the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database operations

## Domain Normalization

The script automatically normalizes domain names from various formats:
- `asking-questions` → `Asking Questions`
- `refining_questions` → `Refining Questions & Targeting`
- `navigation` → `Navigation and Basic Module Functions`

This ensures consistency across different naming conventions in MDX files.

## Output Features

### Color-Coded Terminal Output
- 🚀 **Headers**: Bold white for important sections
- ✅ **Success**: Green for successful operations
- ⚠️ **Warnings**: Yellow for skipped items or dry-run mode
- ❌ **Errors**: Red for failed operations
- 📦 **Processing**: Cyan for current operations
- 📊 **Summary**: Statistics at the end of execution

### Summary Statistics
After execution, the script provides:
- Number of modules processed
- Number of modules skipped
- Number of errors encountered
- Clear indication if running in dry-run mode

## MDX File Processing

The script processes MDX files from `/src/content/modules/` and extracts:

### Frontmatter Fields
- `id`: Unique module identifier (required)
- `title`: Module title
- `domain` / `domainEnum` / `domainSlug`: Domain classification
- `description`: Module description
- `blueprintWeight`: Exam weight percentage
- `estimatedTime`: Time to complete module
- `learningObjectives` / `objectives`: Learning goals
- `version`: Module version

### Content Sections
The script automatically parses markdown headers (## or #) as sections:
- Extracts section titles
- Preserves content formatting
- Supports estimated time in headers (e.g., "## Section (45 minutes)")
- Maintains section order

## Database Operations

### Upsert Strategy
- Updates existing modules with matching IDs
- Inserts new modules if not present
- Preserves database integrity with transactions

### Section Management
- Clears existing sections before inserting new ones
- Prevents duplicate sections
- Maintains proper order indexing

## Error Handling

The script includes comprehensive error handling:
- Missing environment variables
- Invalid MDX frontmatter
- Database connection issues
- Transaction rollback on failures
- Detailed error messages with context

## Best Practices

1. **Always run dry-run first**: Test changes before applying to production
2. **Use verbose mode for debugging**: Get detailed output when troubleshooting
3. **Target specific domains**: Reduce risk by updating one domain at a time
4. **Check environment variables**: Ensure database credentials are correct
5. **Review MDX frontmatter**: Validate required fields before seeding

## Migration from Old Script

The enhanced script is backward compatible with the original `seed-modules-from-mdx.ts`. To migrate:

1. Update package.json script reference (already done)
2. No changes needed to MDX files
3. All existing functionality preserved
4. New features are opt-in via flags

## Troubleshooting

### Missing Environment Variables
```
Fatal error: Missing env var: NEXT_PUBLIC_SUPABASE_URL
```
**Solution**: Set required environment variables before running

### No MDX Files Found
```
No MDX files found under src/content/modules
```
**Solution**: Ensure MDX files exist in the correct directory

### Domain Not Matching
```
Skipping file.mdx: domain "X" doesn't match filter
```
**Solution**: Check domain name spelling and normalization

## Future Enhancements

Potential improvements for future versions:
- [ ] Batch processing for large datasets
- [ ] Rollback capability
- [ ] Diff visualization before applying changes
- [ ] Import/export to JSON format
- [ ] Version control integration
- [ ] Automated testing of MDX content
- [ ] Multi-language support

## Related Documentation

- `/docs/NEXT_SESSION_PROMPT.md` - Project context and priorities
- `/docs/ERROR_TRACKING.md` - Error tracking implementation
- `/docs/PRACTICE_TARGETING_ENHANCEMENT.md` - Practice system enhancements
- `/src/content/modules/*.mdx` - Source MDX files