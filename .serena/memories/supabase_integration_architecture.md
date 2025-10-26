# Supabase Integration Architecture - Modern TCO

## Database Schema Overview

The application uses a comprehensive Supabase schema with the following core tables:

### Tables

1. **users** - Extended user profiles (references auth.users)
2. **questions** - Exam questions with metadata and tagging
3. **exam_sessions** - User exam sessions and results
4. **user_progress** - Individual question responses and progress
5. **user_statistics** - Aggregated performance metrics
6. **incorrect_answers** - Tracking of mistakes for review
7. **module_progress** - Module-specific learning progress
8. **user_settings** - User preferences and configuration

### Key Features

- **Row Level Security (RLS)**: All tables have user-based security policies
- **Real-time Subscriptions**: Live updates for collaborative features
- **Automatic Triggers**: Statistics updates and timestamp management
- **Type Safety**: Generated TypeScript types from schema

## Integration Strategy: Dual Storage

### Primary Storage (Authenticated Users)

- **Supabase Database**: Real-time sync across devices
- **Immediate Persistence**: All user actions saved instantly
- **Cross-Device Sync**: Seamless experience across platforms

### Fallback Storage (Offline/Unauthenticated)

- **localStorage**: Browser-based persistence
- **Automatic Migration**: Data moves to database when user authenticates
- **Graceful Degradation**: Full functionality even offline

## Context Architecture

### 9 Integrated Contexts

1. **AuthContext** - Supabase Auth integration with session management
2. **DatabaseContext** - Core database operations and connection management
3. **QuestionsContext** - Question loading with 5-minute caching strategy
4. **ExamContext** - Session management with database persistence
5. **ProgressContext** - User statistics with real-time sync
6. **SettingsContext** - User preferences with debounced saves
7. **IncorrectAnswersContext** - Mistake tracking with immediate sync
8. **ModuleContext** - Module progress with upsert operations
9. **SearchContext** - Database-backed search functionality

## Performance Optimizations

### Caching Strategy

- **Questions Cache**: 5-minute cache to reduce database calls
- **Optimistic Updates**: UI updates before database confirmation
- **Batch Operations**: Group related database operations
- **Connection Pooling**: Efficient database connection management

### Real-time Features

- **Selective Subscriptions**: Only subscribe to relevant data
- **Event Filtering**: Client-side filtering of real-time events
- **Graceful Reconnection**: Automatic reconnection on network issues

## Error Handling Patterns

### Database Errors

- **Graceful Fallbacks**: Always fallback to localStorage
- **Error Logging**: Comprehensive error tracking for debugging
- **User Communication**: Clear error messages without technical details
- **Retry Logic**: Automatic retry for transient failures

### Authentication Errors

- **Session Management**: Automatic session refresh
- **Redirect Logic**: Seamless authentication flow
- **State Preservation**: Maintain user state during auth transitions

## Security Implementation

### Row Level Security

- **User Isolation**: Each user can only access their own data
- **Admin Override**: Service role key for administrative operations
- **Query Filtering**: Automatic user_id filtering on all operations

### API Security

- **Environment Variables**: Secure credential management
- **Token Validation**: Automatic token verification
- **Role-based Access**: Different permissions for different user types

## Migration Status

✅ **Complete Database Integration**: All 7 contexts successfully migrated
✅ **Backward Compatibility**: localStorage fallback maintained
✅ **Type Safety**: Full TypeScript integration with generated types
✅ **Real-time Sync**: Live updates across all contexts
✅ **Performance Optimized**: Caching and batching implemented
