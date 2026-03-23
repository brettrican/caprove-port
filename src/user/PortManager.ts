import DockerApi from '../docker/DockerApi'
import DockerService from '../models/DockerService'
import {
    PortConflict,
    PortInfo,
    PortManagementStats,
    PortScanOptions,
    PortSuggestion,
} from '../models/PortInfo'
import Logger from '../utils/Logger'
import { execSync } from 'child_process'

/**
 * CRITICAL FIX for MaxListenersExceededWarning
 * 
 * Root Cause: Original PortManager used execPromise with callbacks
 * that created pipe event listeners never cleaned up.
 * 
 * Solution: Use execSync instead for batch operations and
 * implement proper resource cleanup
 */

class PortManager {
    private dockerApi: DockerApi
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
    private scanInProgress: boolean = false

    constructor(dockerApi: DockerApi) {
        this.dockerApi = dockerApi
    }

    async scanPorts(options: PortScanOptions = {}): Promise<PortInfo[]> {
        const cacheKey = JSON.stringify(options)
        const cached = this.getFromCache(cacheKey)
        if (cached) {
            return cached
        }

        if (this.scanInProgress) {
            Logger.d('Port scan already in progress, skipping')
            return []
        }

        this.scanInProgress = true

        try {
            const {
                portRange = { start: 1, end: 65535 },
                protocols = ['tcp'],
                includeContainers = true,
                includeSystemProcesses = true,
            } = options

            const portInfos: PortInfo[] = []

            if (includeSystemProcesses) {
                const systemPorts = this.scanSystemPortsBatch(portRange, protocols)
                portInfos.push(...systemPorts)
            }

            if (includeContainers) {
                const containerPorts = await this.scanContainerPorts()
                portInfos.push(...containerPorts)
            }

            const mergedPorts = this.mergePortInfo(portInfos)
            this.setCache(cacheKey, mergedPorts, 60000) // 60s cache

            return mergedPorts
        } catch (error) {
            Logger.e('Error scanning ports:', error)
            return []
        } finally {
            this.scanInProgress = false
        }
    }

    async getPortManagementStats(): Promise<PortManagementStats> {
        const allPorts = await this.scanPorts({
            portRange: { start: 1, end: 65535 },
            protocols: ['tcp'],
        })

        const stats: PortManagementStats = {
            totalPorts: 65535,
            usedPorts: allPorts.length,
            availablePorts: 65535 - allPorts.length,
            containerPorts: allPorts.filter((p) => p.container).length,
            systemPorts: allPorts.filter((p) => p.process && !p.container).length,
            lastScan: new Date().toISOString(),
        }

        return stats
    }

    async suggestAvailablePorts(
        count: number = 1,
        preferredRange?: { start: number; end: number }
    ): Promise<PortSuggestion[]> {
        const range = preferredRange || { start: 3000, end: 9000 }
        const usedPorts = await this.scanPorts({ portRange: range })
        const usedPortNumbers = new Set(usedPorts.map((p) => p.port))

        const suggestions: PortSuggestion[] = []
        const reservedPorts = new Set([
            22, 80, 443, 8080, 8443, 3000, 5000, 5432, 3306, 6379, 27017, 25,
            53, 110, 143, 993, 995, 587, 465, 21, 23, 161, 162,
        ])

        for (let port = range.start; port <= range.end && suggestions.length < count; port++) {
            if (!usedPortNumbers.has(port) && !reservedPorts.has(port)) {
                suggestions.push({
                    port,
                    reason: 'Available port in preferred range',
                    confidence: 'high',
                })
            }
        }

        if (suggestions.length < count) {
            const expandedUsedPorts = await this.scanPorts({
                portRange: { start: 10000, end: 60000 },
            })
            const expandedUsedNumbers = new Set(expandedUsedPorts.map((p) => p.port))

            for (let port = 10000; port <= 60000 && suggestions.length < count; port++) {
                if (!expandedUsedNumbers.has(port) && !reservedPorts.has(port)) {
                    suggestions.push({
                        port,
                        reason: 'Available port in extended range',
                        confidence: 'medium',
                    })
                }
            }
        }

        return suggestions
    }

    async checkPortConflict(port: number, protocol: 'tcp' | 'udp' = 'tcp'): Promise<PortConflict | null> {
        const ports = await this.scanPorts({
            portRange: { start: Math.max(1, port - 5), end: Math.min(65535, port + 5) },
            protocols: [protocol],
        })

        const portInfo = ports.find((p) => p.port === port && p.protocol === protocol)

        if (!portInfo || portInfo.state === 'closed') {
            return null
        }

        let conflictType: PortConflict['conflictType']
        let conflictingEntity: string
        let severity: PortConflict['severity']

        if (portInfo.container) {
            conflictType = 'container'
            conflictingEntity = `Container: ${portInfo.container.name} (${portInfo.container.appName || 'Unknown App'})`
            severity = 'medium'
        } else if (portInfo.process) {
            conflictType = 'process'
            conflictingEntity = `Process: ${portInfo.process.name} (PID: ${portInfo.process.pid})`
            severity = portInfo.process.user === 'root' ? 'high' : 'medium'
        } else {
            conflictType = 'system'
            conflictingEntity = 'System service'
            severity = 'high'
        }

        return {
            port,
            conflictType,
            conflictingEntity,
            severity,
            resolution: {
                action: conflictType === 'container' ? 'stop' : conflictType === 'process' ? 'kill' : 'reassign',
                description:
                    conflictType === 'container'
                        ? 'Stop conflicting container'
                        : conflictType === 'process'
                          ? 'Kill conflicting process'
                          : 'Use a different port',
            },
        }
    }

    async killProcess(pid: number, signal: number = 15): Promise<void> {
        try {
            execSync(`kill -${signal} ${pid}`, { timeout: 2000 })
            Logger.d(`Successfully killed process ${pid}`)
        } catch (error: any) {
            if (error.status === 1 || error.message.includes('No such process')) {
                Logger.d(`Process ${pid} no longer exists`)
                return
            }
            Logger.e(`Failed to kill process ${pid}:`, error.message)
            throw new Error(`Failed to kill process ${pid}`)
        }
    }

    async stopContainer(containerId: string): Promise<void> {
        try {
            const dockerApiInstance = DockerApi.get()
            await dockerApiInstance.ensureContainerStoppedAndRemoved(containerId, containerId)
            Logger.d(`Successfully stopped container ${containerId}`)
        } catch (error) {
            Logger.e(`Failed to stop container ${containerId}:`, error)
            throw new Error(`Failed to stop container ${containerId}`)
        }
    }

    async getContainersByPort(port: number): Promise<DockerService[]> {
        try {
            const services = await this.dockerApi.getAllServices()
            return services.filter((service: DockerService) =>
                service.Endpoint?.Ports?.some((p: any) => p.PublishedPort === port)
            )
        } catch (error) {
            Logger.e(`Failed to get containers for port ${port}:`, error)
            return []
        }
    }

    private scanSystemPortsBatch(portRange: { start: number; end: number }, protocols: string[]): PortInfo[] {
        const portInfos: PortInfo[] = []

        try {
            let output = ''
            try {
                output = execSync('netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null', {
                    encoding: 'utf-8',
                    timeout: 5000,
                }).toString()
            } catch {
                try {
                    output = execSync('ss -tlnp', { encoding: 'utf-8', timeout: 5000 }).toString()
                } catch {
                    return portInfos
                }
            }

            const lines = output.split('\n')
            for (const line of lines) {
                if (!line.includes('LISTEN')) continue

                const match = line.match(/:([0-9]+)\s+.*?([0-9]+)\/(.+?)\s/)
                if (match) {
                    const port = parseInt(match[1])
                    const pid = parseInt(match[2])
                    const processName = match[3]

                    if (port >= portRange.start && port <= portRange.end && port > 0) {
                        portInfos.push({
                            port,
                            protocol: 'tcp',
                            state: 'open',
                            process: {
                                pid,
                                name: processName.split('/')[0],
                                command: processName,
                                user: 'system',
                                cpu: 0,
                                memory: 0,
                            },
                            timestamp: new Date().toISOString(),
                        })
                    }
                }
            }
        } catch (error) {
            Logger.w('Failed to scan system ports')
        }

        return portInfos
    }

    private async scanContainerPorts(): Promise<PortInfo[]> {
        const portInfos: PortInfo[] = []

        try {
            const services = await this.dockerApi.getAllServices()

            for (const service of services) {
                if (service.Endpoint?.Ports) {
                    for (const portInfo of service.Endpoint.Ports) {
                        if (portInfo.PublishedPort) {
                            portInfos.push({
                                port: portInfo.PublishedPort,
                                protocol: (portInfo.Protocol?.toLowerCase() as 'tcp' | 'udp') || 'tcp',
                                state: 'open',
                                container: {
                                    id: service.ID || '',
                                    name: service.Spec?.Name || '',
                                    image: service.Spec?.TaskTemplate?.ContainerSpec?.Image || '',
                                    status: 'running',
                                    appName: service.Spec?.Labels?.['com.captain.app-name'] || service.Spec?.Name,
                                },
                                timestamp: new Date().toISOString(),
                            })
                        }
                    }
                }
            }
        } catch (error) {
            Logger.w('Failed to scan container ports')
        }

        return portInfos
    }

    private mergePortInfo(portInfos: PortInfo[]): PortInfo[] {
        const merged = new Map<string, PortInfo>()

        for (const portInfo of portInfos) {
            const key = `${portInfo.port}-${portInfo.protocol}`

            if (merged.has(key)) {
                const existing = merged.get(key)!
                if (portInfo.container && !existing.container) {
                    existing.container = portInfo.container
                }
                if (portInfo.process && !existing.process) {
                    existing.process = portInfo.process
                }
            } else {
                merged.set(key, portInfo)
            }
        }

        return Array.from(merged.values())
    }

    private getFromCache(key: string): any {
        const cached = this.cache.get(key)
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data
        }
        this.cache.delete(key)
        return null
    }

    private setCache(key: string, data: any, ttl: number): void {
        this.cache.set(key, { data, timestamp: Date.now(), ttl })
    }
}

export default PortManager
