# CapRover Port Manager - Docker Entrypoint Fix

## Problem Summary

The `caprove-port` Docker container was exiting with exit code 0 immediately after startup, preventing the CapRover service from running properly. The application would log:

```
Overriding useExistingSwarm from /captain/data/config-override.json
March 23rd 2026, 2:35:23.982 pm    Docker API Version on host: 1.54
```

Then exit cleanly without ever starting the HTTP server.

## Root Cause Analysis

### Issue: Wrong Entry Point in Dockerfile

The Dockerfile's CMD instruction was incorrect:

```dockerfile
CMD ["node", "./built/app.js"]  # ❌ WRONG
```

**Why this was wrong:**
- `app.ts` (compiled to `built/app.js`) only **defines and exports the Express application**
- It does NOT start the HTTP server
- The file sets up routes, middleware, and exports the app for use as a module
- No server listener is created or started

### Correct Entry Point

The actual server startup code is in `server.ts`:

```typescript
// src/server.ts
function startServer() {
    // Creates HTTP server
    // Calls app.listen() on port 3000
    // Keeps the process alive
}

startServer()  // ← This call was missing!
```

When compiled to `built/server.js`, it contains the `startServer()` call at module level, which:
1. Imports the Express app from `app.js`
2. Creates an HTTP server
3. Starts listening on port 3000
4. Keeps the Node.js process alive

## Solution Implemented

### Fix: Update Dockerfile CMD

**Before:**
```dockerfile
CMD ["node", "./built/app.js"]
```

**After:**
```dockerfile
CMD ["node", "./built/server.js"]
```

### Changes Made

1. Updated `Dockerfile` line (end of file):
   ```dockerfile
   CMD ["node", "./built/server.js"]
   ```

2. Rebuilt and pushed image:
   ```bash
   docker context use mli
   cd ~/coding/caprove-port
   docker build -t caprove-port:latest .
   docker tag caprove-port:latest ghcr.io/brettrican/caprove-port:latest
   docker push ghcr.io/brettrican/caprove-port:latest
   docker context use default
   ```

3. Updated Docker Swarm service:
   ```bash
   ssh sm@100.80.246.85
   
   # Stop old service
   sudo docker service rm captain-captain
   
   # Create new service with corrected image
   sudo docker service create \
     --name captain-captain \
     --publish 3000:3000 \
     --publish 80:80 \
     --publish 443:443 \
     --mount type=bind,source=/captain,target=/captain \
     --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
     --env CAPTAIN_DEBUG=true \
     --env NODE_ENV=development \
     ghcr.io/brettrican/caprove-port:latest
   ```

## Verification

### Before Fix
- Container exits with code 0
- Service repeatedly restarts
- No HTTP server listening on port 3000
- Logs show only initialization messages

### After Fix
- Container stays running
- Service is healthy
- HTTP server listens on port 3000
- All endpoints respond (health check, API, dashboard)

### Test Commands

```bash
# Check service status
sudo docker service ps captain-captain
# Should show: DESIRED STATE = Running, CURRENT STATE = Running

# Health check
curl -s http://localhost:3000/health
# Expected: HTTP 200

# Port Management API
curl -s http://localhost:3000/api/v2/user/ports/scan \
  -H "x-captain-auth: test"
# Expected: JSON response with ports data

# Port Management Dashboard
http://captain.mli-corp.pw:3000/port-management.html
# Expected: Interactive dashboard loads
```

## Key Learnings

1. **Module Structure:** TypeScript/Node projects may have separate files for:
   - `app.ts` - Application definition and configuration
   - `server.ts` - Server startup and process management

2. **Entry Point Matters:** The Dockerfile CMD must point to the file that **starts** the server, not just defines it.

3. **Exit Code 0 vs Exit Code 1:**
   - Exit code 0 = Process exited successfully (no error) but prematurely
   - Exit code 1+ = Process crashed or encountered an error
   - This made debugging harder—the container wasn't crashing, it was completing too early

4. **Build Process Check:** Always verify that the compiled `built/` directory contains:
   - `app.js` - Express app setup
   - `server.js` - Server startup code with `startServer()` call

## Files Modified

- `Dockerfile` - Line with CMD instruction

## Related Components

- **Port Manager:** Uses singleton pattern (`getPortManagerSingleton()`) to prevent MaxListenersExceededWarning
- **Port Management Dashboard:** Accessible at `http://captain.mli-corp.pw:3000/port-management.html`
- **Port Management API:** Endpoints in `src/routes/user/ports/PortRouter.ts`

## Future Considerations

1. Add explicit server startup logging to `server.ts`
2. Consider adding a startup health check
3. Document the app.ts vs server.ts separation in main README
4. Validate entry point in CI/CD pipeline
