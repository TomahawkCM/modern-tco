# Hardware Optimization Verification - Next Session

## Quick Start Prompt

```
Verify the WSL2 and Next.js optimizations are working correctly:

1. Check WSL2 resource allocation (should show 25GB RAM, 12 CPUs)
2. Test Turbopack dev server startup and performance
3. Measure build performance with new parallel settings
4. Compare before/after metrics
5. Provide optimization report

Expected improvements:
- RAM: 31GB → 25GB allocated to WSL2 (up from ~15GB default)
- CPU: All 12 threads active
- Dev startup: 50-70% faster with Turbopack
- Build time: 50-66% faster with 16GB + 12 threads
- HMR: 90% faster (500ms → 50ms)
```

---

## Detailed Verification Steps

### 1. WSL2 Configuration Verification

**Run these commands and report results:**

```bash
# Check RAM allocation (should show ~25GB total)
free -h

# Check CPU cores (should show 12)
nproc

# Check swap (should show 16GB)
swapon --show

# Verify GPU passthrough
nvidia-smi

# Check current resource usage
htop  # or: top
```

**Expected Results:**
- Total RAM: ~25GB (not 31GB - Windows reserves some)
- Available RAM: 23-24GB free
- CPU cores: 12
- Swap: 16GB
- GPU: Quadro RTX 5000 visible

---

### 2. Next.js Development Server Test

**Test Turbopack performance:**

```bash
cd /home/robne/projects/active/tanium-tco/modern-tco

# Measure startup time
time npm run dev

# Watch for:
# - "Turbopack" mention in startup logs
# - Startup time (should be 5-8 seconds)
# - Memory allocation (8GB via NODE_OPTIONS)
# - Thread pool size (12 threads)
```

**In another terminal, monitor resources:**

```bash
# Watch memory usage during dev
watch -n 1 'free -h && echo "" && ps aux | grep "next dev" | grep -v grep'

# Check CPU utilization
htop  # Should see multiple Node processes using multiple cores
```

---

### 3. Build Performance Test

**Test production build with new settings:**

```bash
# Measure build time
time npm run build

# Expected improvements:
# - Build time: 40-60 seconds (was 90-120s)
# - Memory usage: Up to 16GB available
# - CPU: All 12 cores utilized
```

**Monitor during build:**

```bash
# In another terminal
htop  # Should see high CPU utilization across all 12 cores
```

---

### 4. Performance Comparison Report

**Create a report comparing before/after:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| WSL RAM allocated | ~15GB | 25GB | +67% |
| Dev startup time | 15s | 5-8s | 50-70% |
| Hot reload (HMR) | 500ms | 50ms | 90% |
| Full build time | 120s | 40-60s | 50-66% |
| TypeScript check | 30s | 12-15s | 50-60% |
| CPU cores used | 1-2 | 12 | 6-12x |
| Build memory limit | 8GB | 16GB | 2x |

---

### 5. Turbopack Verification

**Confirm Turbopack is active:**

```bash
npm run dev 2>&1 | grep -i turbopack
# Should see: "Turbopack" or "turbo" in output
```

**Test hot reload speed:**

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Edit a file: `src/app/page.tsx`
4. Measure reload time (should be <100ms)

---

## Troubleshooting

### If RAM is still showing 31GB:

```bash
# WSL config not applied - run in PowerShell:
wsl --shutdown
# Then restart WSL
```

### If CPU cores not all being used:

```bash
# Check UV_THREADPOOL_SIZE is set
npm run dev 2>&1 | grep -i "threadpool\|uv_"
```

### If Turbopack not working:

```bash
# Check Next.js version (should be 15.5.x)
npm list next

# Manually test Turbopack
npx next dev --turbopack
```

---

## Success Criteria

✅ **WSL2 Configuration:**
- [ ] RAM: 25GB allocated
- [ ] CPU: 12 cores available
- [ ] Swap: 16GB configured
- [ ] GPU: Quadro RTX 5000 active

✅ **Development Performance:**
- [ ] Dev server starts in <10s
- [ ] Turbopack active (check logs)
- [ ] HMR reloads in <100ms
- [ ] Memory headroom: 20GB+ available

✅ **Build Performance:**
- [ ] Build completes in <60s
- [ ] All 12 cores utilized during build
- [ ] No memory errors
- [ ] Successful production build

---

## Quick Prompt for Claude

**Copy/paste this in next session:**

```
Test the hardware optimizations we configured:

1. Verify WSL2 config: Run `free -h`, `nproc`, `swapon --show`, `nvidia-smi`
2. Test dev server: `time npm run dev` - should start in 5-8s with Turbopack
3. Test build: `time npm run build` - should complete in 40-60s
4. Monitor resources during both operations
5. Create performance comparison report

Expected: 25GB RAM, 12 CPUs, Turbopack active, 50-70% faster startup, 50-66% faster builds.
```
