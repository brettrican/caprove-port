export interface PortInfo {
    port: number
    protocol: 'tcp' | 'udp'
    state: 'open' | 'closed' | 'filtered'
    process?: {
        pid: number
        name: string
        command: string
        user: string
        cpu: number
        memory: number
    }
    container?: {
        id: string
        name: string
        image: string
        status: string
        appName?: string
    }
    timestamp: string
}

export interface PortSuggestion {
    port: number
    reason: string
    confidence: 'high' | 'medium' | 'low'
}

export interface PortConflict {
    port: number
    conflictType: 'process' | 'container' | 'system'
    conflictingEntity: string
    severity: 'high' | 'medium' | 'low'
    resolution?: {
        action: 'kill' | 'stop' | 'reassign' | 'ignore'
        description: string
    }
}

export interface PortManagementStats {
    totalPorts: number
    usedPorts: number
    availablePorts: number
    containerPorts: number
    systemPorts: number
    lastScan: string
}

export interface PortScanOptions {
    portRange?: {
        start: number
        end: number
    }
    protocols?: ('tcp' | 'udp')[]
    includeContainers?: boolean
    includeSystemProcesses?: boolean
    timeout?: number
}
