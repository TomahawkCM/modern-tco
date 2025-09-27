# 🎯 Tanium Simulator Module - Improvement TODO Guide

> **Status**: Planning Complete | **Last Updated**: 2025-09-24
> **Purpose**: Comprehensive guide for implementing simulator improvements across sessions

## 📊 Current State Analysis

### Architecture Overview
- **Backend**: Python subprocess (`sim/tanium_simulator_v2.py`) - 800+ lines
- **Runner**: Node.js wrapper (`src/lib/simulator-runner.ts`) - Process spawning
- **Frontend**: Next.js page (`src/app/simulator/page.tsx`) - Monaco editor UI
- **API Routes**: 5 endpoints (`sim-eval`, `sim-meta`, `sim-saved`, `sim-save`, `sim-run`)
- **Data Storage**: Local SQLite (`sim/inventory.sqlite`) + JSON files

### Critical Issues Identified
1. **Performance**: 8-second timeout, subprocess overhead, no caching
2. **Dependencies**: Requires Python 3.x installed, platform-specific issues
3. **Scalability**: Single-threaded, no concurrent query support
4. **Data**: Hardcoded sample data, no real-time updates
5. **Testing**: Minimal coverage (~10%), no integration tests
6. **UX**: Basic error messages, no query optimization hints

## 🚀 Implementation Roadmap

### Phase 1: Critical Foundation (Weeks 1-2)
**Goal**: Eliminate Python dependency, improve performance by 10x

#### Week 1: Core Migration
- [ ] **Task 1.1**: Create TypeScript Query Engine
  - File: Create `src/lib/tanium-query-engine/index.ts`
  - Port parsing logic from `tanium_simulator_v2.py`
  - Implement `TaniumQueryParser` class
  - Add proper TypeScript types for all query components
  - **Time**: 2 days
  - **Dependencies**: None
  - **Success**: All Python unit tests pass in TypeScript

- [ ] **Task 1.2**: Implement Query Lexer/Parser
  - File: Create `src/lib/tanium-query-engine/parser.ts`
  - Build tokenizer for TQL syntax
  - Implement recursive descent parser
  - Add comprehensive error reporting with positions
  - **Time**: 2 days
  - **Dependencies**: Task 1.1
  - **Success**: Parse all example queries correctly

- [ ] **Task 1.3**: Create Query Executor
  - File: Create `src/lib/tanium-query-engine/executor.ts`
  - Implement filter evaluation logic
  - Add aggregation functions (count, min, max, avg, sum)
  - Support group by, order by, limit clauses
  - **Time**: 1 day
  - **Dependencies**: Task 1.2
  - **Success**: Execute queries <100ms

#### Week 2: Database Integration
- [ ] **Task 1.4**: Migrate to Supabase
  - File: Create `supabase/migrations/003_simulator_tables.sql`
  - Design schema for `simulator_machines` table
  - Create indexes for common query patterns
  - Implement RLS policies for multi-tenant support
  - **Time**: 1 day
  - **Dependencies**: None
  - **Success**: Schema deployed to Supabase

- [ ] **Task 1.5**: Implement Data Access Layer
  - File: Create `src/lib/tanium-query-engine/database.ts`
  - Connect to Supabase using existing client
  - Implement query translation to SQL
  - Add connection pooling and retry logic
  - **Time**: 1 day
  - **Dependencies**: Task 1.4
  - **Success**: All queries work against PostgreSQL

- [ ] **Task 1.6**: Add Caching Layer
  - File: Create `src/lib/tanium-query-engine/cache.ts`
  - Implement LRU cache for parsed queries
  - Cache query results with TTL
  - Add cache invalidation on data updates
  - **Time**: 1 day
  - **Dependencies**: Task 1.5
  - **Success**: 90% cache hit rate for repeated queries

- [ ] **Task 1.7**: Update API Routes
  - Files: Update all `/api/sim-*` routes
  - Remove Python subprocess calls
  - Use new TypeScript engine
  - Add proper error handling and validation
  - **Time**: 1 day
  - **Dependencies**: Tasks 1.1-1.6
  - **Success**: All API endpoints functional

### Phase 2: Performance & Scalability (Weeks 3-4)
**Goal**: Achieve <50ms query execution, add real-time features

#### Week 3: Advanced Optimization
- [ ] **Task 2.1**: WebAssembly Query Parser
  - File: Create `src/lib/tanium-query-engine/wasm/`
  - Set up AssemblyScript/Rust toolchain
  - Compile parser to WASM
  - Benchmark performance improvements
  - **Time**: 3 days
  - **Dependencies**: Phase 1 complete
  - **Success**: 5x faster parsing

- [ ] **Task 2.2**: Query Plan Optimizer
  - File: Create `src/lib/tanium-query-engine/optimizer.ts`
  - Implement cost-based optimization
  - Add query plan caching
  - Create explain plan functionality
  - **Time**: 2 days
  - **Dependencies**: Task 2.1
  - **Success**: Complex queries optimized automatically

#### Week 4: Real-time Features
- [ ] **Task 2.3**: Real-time Subscriptions
  - File: Create `src/lib/tanium-query-engine/realtime.ts`
  - Implement Supabase real-time listeners
  - Add WebSocket connection management
  - Create subscription cleanup on unmount
  - **Time**: 2 days
  - **Dependencies**: Phase 1 complete
  - **Success**: Live updates in UI

- [ ] **Task 2.4**: Collaborative Features
  - File: Update `src/app/simulator/page.tsx`
  - Add shared query sessions
  - Implement cursor presence
  - Create query sharing URLs
  - **Time**: 2 days
  - **Dependencies**: Task 2.3
  - **Success**: Multiple users can collaborate

- [ ] **Task 2.5**: Query Builder UI
  - File: Create `src/components/simulator/QueryBuilder.tsx`
  - Build drag-and-drop interface
  - Add visual query construction
  - Implement two-way sync with text editor
  - **Time**: 2 days
  - **Dependencies**: None
  - **Success**: Non-technical users can build queries

### Phase 3: Enterprise Features (Weeks 5-6)
**Goal**: Production-ready with full testing and analytics

#### Week 5: Enhanced UX & Analytics
- [ ] **Task 3.1**: Advanced Autocomplete
  - File: Update Monaco editor configuration
  - Add context-aware suggestions
  - Implement AI-powered completions
  - Create snippet library
  - **Time**: 2 days
  - **Dependencies**: Phase 1 complete
  - **Success**: 80% reduction in syntax errors

- [ ] **Task 3.2**: Query Templates System
  - File: Create `src/lib/simulator-templates/`
  - Build template management system
  - Add parameterized queries
  - Create template marketplace
  - **Time**: 2 days
  - **Dependencies**: None
  - **Success**: 50+ templates available

- [ ] **Task 3.3**: Analytics Integration
  - File: Update PostHog configuration
  - Track query patterns
  - Monitor performance metrics
  - Create usage dashboards
  - **Time**: 1 day
  - **Dependencies**: None
  - **Success**: Full query analytics available

#### Week 6: Testing & Documentation
- [ ] **Task 3.4**: Comprehensive Testing
  - Files: Create `tests/simulator/` directory
  - Write unit tests for parser (>95% coverage)
  - Add integration tests for API routes
  - Create E2E tests with Playwright
  - **Time**: 3 days
  - **Dependencies**: All previous tasks
  - **Success**: All tests passing in CI/CD

- [ ] **Task 3.5**: Performance Benchmarks
  - File: Create `benchmarks/simulator.bench.ts`
  - Benchmark query parsing speed
  - Test concurrent query handling
  - Measure memory usage
  - **Time**: 1 day
  - **Dependencies**: Task 3.4
  - **Success**: Meet performance targets

- [ ] **Task 3.6**: Documentation
  - File: Create `docs/simulator-guide.md`
  - Document TQL syntax
  - Create API reference
  - Add troubleshooting guide
  - **Time**: 1 day
  - **Dependencies**: All tasks
  - **Success**: Complete documentation

## 📋 Technical Specifications

### Database Schema
```sql
CREATE TABLE simulator_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_name TEXT NOT NULL,
  role TEXT,
  os_platform TEXT,
  os_version TEXT,
  group_name TEXT,
  location TEXT,
  disk_free_gb DECIMAL(10,2),
  memory_gb DECIMAL(10,2),
  cpu_percent DECIMAL(5,2),
  compliance_score DECIMAL(3,2),
  last_reboot TIMESTAMP,
  last_seen TIMESTAMP,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_simulator_machines_user ON simulator_machines(user_id);
CREATE INDEX idx_simulator_machines_group ON simulator_machines(group_name);
CREATE INDEX idx_simulator_machines_os ON simulator_machines(os_platform);
```

### API Endpoints
```typescript
// POST /api/simulator/query
{
  question: string;
  format?: 'json' | 'csv';
  saveAs?: string;
}

// GET /api/simulator/templates
// GET /api/simulator/saved
// POST /api/simulator/share
// WebSocket /api/simulator/realtime
```

### Key Dependencies to Add
```json
{
  "better-sqlite3": "^9.0.0",
  "@assemblyscript/loader": "^0.27.0",
  "lru-cache": "^10.0.0",
  "@supabase/realtime-js": "^2.8.0"
}
```

## 🎯 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Query Execution Time | 8000ms | <100ms | Performance monitor |
| Python Dependency | Required | None | Dependency check |
| Test Coverage | ~10% | >90% | Vitest coverage |
| Concurrent Users | 1 | 1000+ | Load testing |
| Error Rate | ~30% | <5% | Error tracking |
| Cache Hit Rate | 0% | >90% | Cache metrics |

## 🔄 Session Continuity

### For Next Session
1. Check completed tasks in this document
2. Review any in-progress work in git
3. Run tests to verify current state
4. Continue with next uncompleted task
5. Update this document with progress

### Key Files to Review
- `/sim/tanium_simulator_v2.py` - Original Python implementation
- `/src/lib/simulator-runner.ts` - Current Node wrapper
- `/src/app/simulator/page.tsx` - UI implementation
- `/src/app/api/sim-*/route.ts` - API endpoints

### Environment Variables
```env
# Add to .env.local
ENABLE_SIMULATOR=true
SIMULATOR_CACHE_TTL=3600
SIMULATOR_MAX_RESULTS=1000
```

## 📚 Resources & References

- [TQL Syntax Documentation](https://docs.tanium.com/asking_questions)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)
- [Supabase Real-time Guide](https://supabase.com/docs/guides/realtime)
- [WebAssembly with AssemblyScript](https://www.assemblyscript.org/)
- [PostHog Events API](https://posthog.com/docs/api/events)

## 🚧 Current Blockers & Decisions

### Open Questions
1. Should we support full TQL syntax or simplified version?
2. Keep backward compatibility with Python version?
3. Multi-tenant data isolation strategy?
4. Real-time collaboration limits?

### Technical Decisions Made
- ✅ Migrate to TypeScript (no Python dependency)
- ✅ Use Supabase for data storage
- ✅ Implement caching for performance
- ✅ Add WebAssembly for critical paths
- ✅ Include comprehensive testing

---

**Note**: This document should be updated after each work session to maintain continuity across different Claude sessions. Mark tasks as complete and add any new findings or blockers discovered during implementation.