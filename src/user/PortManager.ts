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

const execPromise = (
    command: string
): Promise<{ stdout: string; stderr: string }> => {
    return new Promise((resolve, reject) => {
        const childProcess = require('child_process')
        childProcess.exec(
            command,
            (error: any, stdout: string, stderr: string) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({ stdout, stderr })
                }
            }
        )
    })
}

class PortManager {
    private dockerApi: DockerApi
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
        new Map()

    constructor(dockerApi: DockerApi) {
        this.dockerApi = dockerApi
    }

    /**
     * Scan for open ports and their associated processes/containers
     */
    async scanPorts(options: PortScanOptions = {}): Promise<PortInfo[]> {
        const cacheKey = JSON.stringify(options)
        const cached = this.getFromCache(cacheKey)
        if (cached) {
            return cached
        }

        const {
            portRange = { start: 1, end: 65535 },
            protocols = ['tcp'],
            includeContainers = true,
            includeSystemProcesses = true,
            timeout = 1000,
        } = options

        const portInfos: PortInfo[] = []

        try {
            // Scan system processes
            if (includeSystemProcesses) {
                const systemPorts = await this.scanSystemPorts(
                    portRange,
                    protocols,
                    timeout
                )
                portInfos.push(...systemPorts)
            }

            // Scan Docker containers
            if (includeContainers) {
                const containerPorts = await this.scanContainerPorts()
                portInfos.push(...containerPorts)
            }

            // Merge and deduplicate
            const mergedPorts = this.mergePortInfo(portInfos)

            // Cache results
            this.setCache(cacheKey, mergedPorts, 30000) // 30 seconds cache

            return mergedPorts
        } catch (error) {
            Logger.e('Error scanning ports:', error)
            throw error
        }
    }

    /**
     * Get port management statistics
     */
    async getPortManagementStats(): Promise<PortManagementStats> {
        const allPorts = await this.scanPorts({
            portRange: { start: 1, end: 65535 },
            protocols: ['tcp', 'udp'],
        })

        const stats: PortManagementStats = {
            totalPorts: 65535,
            usedPorts: allPorts.length,
            availablePorts: 65535 - allPorts.length,
            containerPorts: allPorts.filter((p) => p.container).length,
            systemPorts: allPorts.filter((p) => p.process && !p.container)
                .length,
            lastScan: new Date().toISOString(),
        }

        return stats
    }

    /**
     * Suggest available ports for new applications
     */
    async suggestAvailablePorts(
        count: number = 1,
        preferredRange?: { start: number; end: number }
    ): Promise<PortSuggestion[]> {
        const usedPorts = await this.scanPorts()
        const usedPortNumbers = new Set(usedPorts.map((p) => p.port))

        const suggestions: PortSuggestion[] = []
        const range = preferredRange || { start: 3000, end: 9000 }

        // Common application ports to avoid
        const reservedPorts = new Set([
            22, 80, 443, 8080, 8443, 3000, 5000, 5432, 3306, 6379, 27017, 25,
            53, 110, 143, 993, 995, 587, 465, 21, 23, 161, 162,
        ])

        for (
            let port = range.start;
            port <= range.end && suggestions.length < count;
            port++
        ) {
            if (!usedPortNumbers.has(port) && !reservedPorts.has(port)) {
                suggestions.push({
                    port,
                    reason: 'Available port in preferred range',
                    confidence: 'high',
                })
            }
        }

        // If we don't have enough suggestions, expand the range
        if (suggestions.length < count) {
            for (
                let port = 10000;
                port <= 60000 && suggestions.length < count;
                port++
            ) {
                if (!usedPortNumbers.has(port) && !reservedPorts.has(port)) {
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

    /**
     * Check for port conflicts for a specific port
     */
    async checkPortConflict(
        port: number,
        protocol: 'tcp' | 'udp' = 'tcp'
    ): Promise<PortConflict | null> {
        const ports = await this.scanPorts({
            portRange: { start: port, end: port },
            protocols: [protocol],
        })

        const portInfo = ports.find(
            (p) => p.port === port && p.protocol === protocol
        )

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

        const resolution: PortConflict['resolution'] = {
            action:
                conflictType === 'container'
                    ? 'stop'
                    : conflictType === 'process'
                      ? 'kill'
                      : 'reassign',
            description:
                conflictType === 'container'
                    ? 'Stop conflicting container'
                    : conflictType === 'process'
                      ? 'Kill conflicting process'
                      : 'Use a different port',
        }

        return {
            port,
            conflictType,
            conflictingEntity,
            severity,
            resolution,
        }
    }

    /**
     * Kill a process by PID
     */
    async killProcess(pid: number, signal: number = 9): Promise<void> {
        return execPromise(`kill -${signal} ${pid}`)
            .then(() => {
                Logger.d(`Successfully killed process ${pid}`)
            })
            .catch((error) => {
                Logger.e(`Failed to kill process ${pid}:`, error)
                throw new Error(`Failed to kill process ${pid}: ${error}`)
            })
    }

    /**
     * Stop a Docker container
     */
    async stopContainer(containerId: string): Promise<void> {
        try {
            const dockerApiInstance = DockerApi.get()
            // Use the existing ensureContainerStoppedAndRemoved method
            await dockerApiInstance.ensureContainerStoppedAndRemoved(
                containerId,
                containerId
            )
            Logger.d(
                `Successfully stopped and removed container ${containerId}`
            )
        } catch (error) {
            Logger.e(`Failed to stop container ${containerId}:`, error)
            throw new Error(`Failed to stop container ${containerId}: ${error}`)
        }
    }

    /**
     * Get detailed information about containers using specific ports
     */
    async getContainersByPort(port: number): Promise<DockerService[]> {
        try {
            const services = await this.dockerApi.getAllServices()
            return services.filter((service: DockerService) =>
                service.Endpoint?.Ports?.some(
                    (p: any) => p.PublishedPort === port
                )
            )
        } catch (error) {
            Logger.e(`Failed to get containers for port ${port}:`, error)
            throw error
        }
    }

    private async scanSystemPorts(
        portRange: { start: number; end: number },
        protocols: string[],
        timeout: number
    ): Promise<PortInfo[]> {
        const portInfos: PortInfo[] = []

        try {
            // Use netstat to get listening ports
            const { stdout } = await execPromise(
                'netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null'
            )
            const lines = stdout.split('\n')

            for (const line of lines) {
                if (line.includes('LISTEN')) {
                    const match = line.match(/:(\d+)\s+.*?(\d+)\/(.+)/)
                    if (match) {
                        const port = parseInt(match[1])
                        const pid = parseInt(match[2])
                        const processName = match[3]

                        if (port >= portRange.start && port <= portRange.end) {
                            // Get process details
                            const processDetails =
                                await this.getProcessDetails(pid)

                            portInfos.push({
                                port,
                                protocol: 'tcp',
                                state: 'open',
                                process: {
                                    pid,
                                    name: processName,
                                    command: processDetails?.command || '',
                                    user: processDetails?.user || 'unknown',
                                    cpu: processDetails?.cpu || 0,
                                    memory: processDetails?.memory || 0,
                                },
                                timestamp: new Date().toISOString(),
                            })
                        }
                    }
                }
            }
        } catch (error) {
            Logger.w('Failed to scan system ports: ' + error)
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
                                protocol:
                                    (portInfo.Protocol?.toLowerCase() as
                                        | 'tcp'
                                        | 'udp') || 'tcp',
                                state: 'open',
                                container: {
                                    id: service.ID || '',
                                    name: service.Spec?.Name || '',
                                    image:
                                        service.Spec?.TaskTemplate
                                            ?.ContainerSpec?.Image || '',
                                    status: 'running',
                                    appName:
                                        service.Spec?.Labels?.[
                                            'com.captain.app-name'
                                        ] || service.Spec?.Name,
                                },
                                timestamp: new Date().toISOString(),
                            })
                        }
                    }
                }
            }
        } catch (error) {
            Logger.w('Failed to scan container ports: ' + error)
        }

        return portInfos
    }

    private async getProcessDetails(pid: number): Promise<{
        command: string
        user: string
        cpu: number
        memory: number
    } | null> {
        try {
            const { stdout: psOutput } = await execPromise(
                `ps -p ${pid} -o pid,user,comm,pcpu,pmem --no-headers`
            )
            const parts = psOutput.trim().split(/\s+/)

            if (parts.length >= 5) {
                return {
                    command: parts[2],
                    user: parts[1],
                    cpu: parseFloat(parts[3]) || 0,
                    memory: parseFloat(parts[4]) || 0,
                }
            }
        } catch (error) {
            // Process might have ended
        }

        return null
    }

    private mergePortInfo(portInfos: PortInfo[]): PortInfo[] {
        const merged = new Map<string, PortInfo>()

        for (const portInfo of portInfos) {
            const key = `${portInfo.port}-${portInfo.protocol}`

            if (merged.has(key)) {
                const existing = merged.get(key)!
                // Merge container and process info if both exist
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
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        })
    }
}

export default PortManager
