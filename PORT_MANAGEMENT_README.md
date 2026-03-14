# CapRover Port Management System

A comprehensive port management overlay for CapRover that provides intelligent port conflict detection, suggestions, and management capabilities.

## Features

### 🔍 **Port Scanning & Detection**
- **Real-time Port Discovery**: Automatically scans system and container ports
- **Conflict Detection**: Identifies port conflicts before deployment
- **Process & Container Mapping**: Shows which processes/containers are using which ports
- **Protocol Support**: TCP and UDP port scanning

### 🎯 **Smart Port Suggestions**
- **Intelligent Recommendations**: Suggests available ports based on usage patterns
- **Conflict-Free Suggestions**: Only suggests ports that are guaranteed to be available
- **Preferred Range Support**: Respects user-defined port ranges
- **Confidence Scoring**: High/medium/low confidence levels for suggestions

### 📊 **Port Management Dashboard**
- **Real-time Statistics**: View total, used, and available ports
- **Visual Interface**: Modern, responsive UI with glass morphism effects
- **Filtering & Search**: Filter by type (container/process/system) or search by name
- **Resource Monitoring**: Shows CPU and memory usage for port-using processes

### ⚡ **Action Capabilities**
- **Process Management**: Kill conflicting processes safely
- **Container Control**: Stop/remove containers using specific ports
- **Port Validation**: Validate ports before app deployment
- **Bulk Operations**: Manage multiple ports simultaneously

## Architecture

### Backend Components

#### **PortManager** (`src/user/PortManager.ts`)
Core port management logic with caching and system integration:
```typescript
class PortManager {
    async scanPorts(options: PortScanOptions): Promise<PortInfo[]>
    async suggestAvailablePorts(count: number, preferredRange?: Range): Promise<PortSuggestion[]>
    async checkPortConflict(port: number, protocol: 'tcp' | 'udp'): Promise<PortConflict | null>
    async killProcess(pid: number, signal?: number): Promise<void>
    async stopContainer(containerId: string): Promise<void>
    async getPortManagementStats(): Promise<PortManagementStats>
}
```

#### **API Endpoints** (`src/routes/user/ports/PortRouter.ts`)
RESTful API endpoints for port management:
- `GET /api/v1/user/ports/scan` - Scan ports with options
- `GET /api/v1/user/ports/stats` - Get port statistics
- `GET /api/v1/user/ports/suggest` - Get port suggestions
- `GET /api/v1/user/ports/suggest-for-app` - Get suggestions for new app
- `POST /api/v1/user/ports/validate` - Validate port for new app
- `GET /api/v1/user/ports/conflict/:port` - Check specific port conflict
- `POST /api/v1/user/ports/kill` - Kill process by PID
- `POST /api/v1/user/ports/stop-container` - Stop container
- `GET /api/v1/user/ports/containers/:port` - Get containers by port

#### **Data Models** (`src/models/PortInfo.ts`)
TypeScript interfaces for port management data:
```typescript
interface PortInfo {
    port: number
    protocol: 'tcp' | 'udp'
    state: 'open' | 'closed' | 'filtered'
    process?: ProcessInfo
    container?: ContainerInfo
    timestamp: string
}

interface PortSuggestion {
    port: number
    reason: string
    confidence: 'high' | 'medium' | 'low'
}

interface PortConflict {
    port: number
    conflictType: 'process' | 'container' | 'system'
    conflictingEntity: string
    severity: 'high' | 'medium' | 'low'
    resolution?: ResolutionAction
}
```

### Frontend Components

#### **Port Management Dashboard** (`public/port-management.html`)
Modern, responsive web interface with:
- **Glass Morphism Design**: Beautiful frosted glass effects
- **Real-time Updates**: Live port scanning and statistics
- **Interactive Tables**: Sortable, filterable port listings
- **Action Buttons**: One-click process/container management
- **Smart Suggestions**: Visual port recommendation cards
- **Responsive Design**: Works on desktop, tablet, and mobile

## Integration Points

### **New App Page Integration**
Enhance the app creation workflow with port suggestions:

```javascript
// Get port suggestions when user selects a port
const response = await fetch('/api/v1/user/ports/suggest-for-app?' + 
    'preferredPort=' + selectedPort + '&count=3');
const { suggestions, conflict } = await response.json();

// Show suggestions if conflict exists
if (conflict) {
    displayPortConflict(conflict);
    displayAlternatives(suggestions);
}
```

### **App Deployment Validation**
Validate ports before app deployment:

```javascript
// Validate port before deployment
const response = await fetch('/api/v1/user/ports/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ port: selectedPort, protocol: 'tcp' })
});
const { isValid, conflict, alternatives } = await response.json();

if (!isValid) {
    showConflictResolution(conflict, alternatives);
}
```

## Security Considerations

### **Process Management**
- **Permission Checks**: Only allows killing processes owned by the captain user
- **Signal Safety**: Uses SIGTERM (15) by default, falls back to SIGKILL (9)
- **Audit Logging**: All actions are logged for security auditing

### **Container Management**
- **Ownership Validation**: Only manages containers created by CapRover
- **Safe Shutdown**: Graceful container shutdown with 10-second timeout
- **Network Isolation**: Container removal includes network disconnection

### **Access Control**
- **Authentication**: All endpoints require valid CapRover user session
- **Authorization**: Port management restricted to admin users
- **Rate Limiting**: Built-in rate limiting prevents abuse

## Performance Optimizations

### **Caching Strategy**
- **30-Second Cache**: Port scan results cached for 30 seconds
- **Smart Invalidation**: Cache invalidated on container/process changes
- **Memory Efficient**: LRU cache with size limits

### **Scanning Efficiency**
- **Incremental Scanning**: Only scan requested port ranges
- **Parallel Processing**: System and container scans run in parallel
- **Optimized Commands**: Uses efficient `netstat` and `ss` commands

## Usage Examples

### **Basic Port Scan**
```bash
curl -X GET "http://localhost:3000/api/v1/user/ports/scan?start=3000&end=3100&protocols=tcp" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Get Port Suggestions**
```bash
curl -X GET "http://localhost:3000/api/v1/user/ports/suggest?count=5&start=3000&end=9000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Validate Port for New App**
```bash
curl -X POST "http://localhost:3000/api/v1/user/ports/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"port": 8080, "protocol": "tcp"}'
```

### **Kill Conflicting Process**
```bash
curl -X POST "http://localhost:3000/api/v1/user/ports/kill" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"pid": 1234, "signal": 15}'
```

## Configuration

### **Environment Variables**
```bash
# Port scanning timeout (milliseconds)
PORT_SCAN_TIMEOUT=1000

# Maximum cache TTL (seconds)
PORT_CACHE_TTL=30

# Reserved ports (comma-separated)
RESERVED_PORTS=22,80,443,8080,8443,3000,5000,5432,3306,6379,27017
```

### **Default Settings**
- **Scan Range**: 1-65535 (configurable)
- **Protocols**: TCP by default, UDP optional
- **Cache TTL**: 30 seconds
- **Suggestion Count**: 3-6 suggestions per request
- **Preferred Range**: 3000-9000 for app suggestions

## Troubleshooting

### **Common Issues**

#### **Permission Denied**
```bash
# Ensure CapRover has sufficient permissions
sudo usermod -aG docker captain
sudo chown -R captain:captain /var/run/docker.sock
```

#### **Missing netstat/ss**
```bash
# Install required system tools
sudo apt-get update
sudo apt-get install net-tools iproute2
```

#### **Container Access Issues**
```bash
# Check Docker daemon permissions
sudo systemctl status docker
sudo usermod -aG docker $USER
```

### **Debug Mode**
Enable debug logging:
```bash
# Set debug environment variable
export DEBUG=port-manager
# Or in CapRover config
{
  "debug": {
    "portManager": true
  }
}
```

## Development

### **Running Tests**
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### **Building Frontend**
```bash
# Install frontend dependencies
cd public
npm install

# Build for production
npm run build

# Start development server
npm run dev
```

## Future Enhancements

### **Planned Features**
- **Port Forwarding Management**: Automatic port forwarding configuration
- **Network Segregation**: VLAN and subnet-aware port management
- **Historical Analytics**: Port usage trends and analytics
- **Alert System**: Real-time alerts for port conflicts
- **API Rate Limiting**: Advanced rate limiting and throttling
- **Multi-Node Support**: Distributed port management across clusters

### **Performance Improvements**
- **WebSocket Integration**: Real-time port updates
- **Background Scanning**: Continuous background port monitoring
- **Machine Learning**: Predictive port suggestion algorithms
- **Database Integration**: Persistent port history storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Ensure all tests pass and code follows style guidelines
5. Submit a pull request with detailed description

## License

This port management system is part of CapRover and follows the same license terms.

---

**Note**: This system requires CapRover v1.10.0+ and Docker API v1.40+ for full functionality.
