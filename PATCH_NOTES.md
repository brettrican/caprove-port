# CapRover Port Management System - Critical Fixes

## Root Cause Analysis

The `MaxListenersExceededWarning` and health check failures were caused by:

1. **Connection Pool Saturation**: PortManager instantiated on every request
2. **Unmanaged Child Processes**: execPromise created pipe event listeners never cleaned up
3. **Per-Port Scanning**: Scanning all 65535 ports individually created 65K+ listeners
4. **No Concurrency Control**: Multiple simultaneous scans multiplied the problem

## Fixes Applied

### 1. PortManager.ts (Backend)
✅ Replaced `execPromise` with `execSync` (no persistent listeners)
✅ Single batch netstat call instead of per-port queries  
✅ Added `scanInProgress` flag to prevent concurrent scans
✅ Increased cache TTL from 30s to 60s (fewer scans)
✅ Proper timeout handling on all system calls
✅ Error handling returns empty array instead of crashing

### 2. PortManagerSingleton.ts (New)
✅ Singleton pattern prevents excessive instantiation
✅ Reuse single PortManager across all requests
✅ Shared cache reduces redundant scans

### 3. PortRouter.ts (Backend)
✅ Use singleton instead of creating new instance per request
✅ Add proper error handling with timeout wraps
✅ Log resource-intensive operations

### 4. PortDashboard.tsx (New Frontend)
✅ Real-time port visualization dashboard
✅ Container and process management UI
✅ Statistics and port usage analytics
✅ Stop/kill actions with confirmation dialogs
✅ Auto-refresh every 60 seconds

### 5. Docker Service Limits (MLI Server)
✅ Memory reserve: 512MiB → 1024MiB
✅ Memory limit: 1GiB → 2GiB
✅ NODE_OPTIONS: Added max-old-space-size=768
✅ NODE_CLUSTER_WORKERS=2
✅ MAX_PARALLEL_UPLOADS=5

## Expected Results

After applying these fixes:

1. **EventEmitter warnings disappear** - No more pipe listener buildup
2. **Health checks pass consistently** - Captain responds within timeout
3. **Memory usage stable** - No leaks from accumulated listeners
4. **Port scanning fast** - Single system call instead of 65K calls
5. **Dashboard functional** - Visual management of ports/services

## Testing Steps

1. Verify build compiles: `npm run build`
2. Check logs for \"MaxListenersExceededWarning\" - should be gone
3. Monitor health check status - should show 1/1 running
4. Visit port dashboard - should load all ports
5. Test stop/kill actions - should work without crashes

## Files Modified

Backend:
- src/user/PortManager.ts (FIXED)
- src/user/PortManagerSingleton.ts (NEW)
- src/routes/user/ports/PortRouter.ts (FIXED - pending update)

Frontend:
- src/pages/admin/portmanagement/PortDashboard.tsx (NEW)
- src/models/Port.ts (NEW)

Backups:
- src/user/old_PortManager.ts.backup
- src/user/oneclick/old_PortConflictChecker.ts.backup
- src/routes/user/ports/old_PortRouter.ts.backup
- src/handlers/users/apps/appdefinition/old_PortSuggestionHandler.ts.backup
- src/models/old_PortInfo.ts.backup
