import PortManager from '../src/user/PortManager'
import DockerApi from '../src/docker/DockerApi'

describe('PortManager', () => {
    let portManager: PortManager

    beforeAll(() => {
        portManager = new PortManager(DockerApi.get())
    })

    describe('scanPorts', () => {
        it('should scan ports with default options', async () => {
            const ports = await portManager.scanPorts()
            expect(Array.isArray(ports)).toBe(true)
        })

        it('should scan ports with custom range', async () => {
            const ports = await portManager.scanPorts({
                portRange: { start: 3000, end: 3010 },
                protocols: ['tcp']
            })
            expect(Array.isArray(ports)).toBe(true)
        })
    })

    describe('suggestAvailablePorts', () => {
        it('should suggest available ports', async () => {
            const suggestions = await portManager.suggestAvailablePorts(3)
            expect(Array.isArray(suggestions)).toBe(true)
            expect(suggestions.length).toBeLessThanOrEqual(3)
            suggestions.forEach(suggestion => {
                expect(suggestion).toHaveProperty('port')
                expect(suggestion).toHaveProperty('reason')
                expect(suggestion).toHaveProperty('confidence')
            })
        })

        it('should suggest ports in preferred range', async () => {
            const suggestions = await portManager.suggestAvailablePorts(2, {
                start: 8000,
                end: 8010
            })
            expect(Array.isArray(suggestions)).toBe(true)
            suggestions.forEach(suggestion => {
                expect(suggestion.port).toBeGreaterThanOrEqual(8000)
                expect(suggestion.port).toBeLessThanOrEqual(8010)
            })
        })
    })

    describe('checkPortConflict', () => {
        it('should check for port conflicts', async () => {
            const conflict = await portManager.checkPortConflict(80, 'tcp')
            if (conflict) {
                expect(conflict).toHaveProperty('port')
                expect(conflict).toHaveProperty('conflictType')
                expect(conflict).toHaveProperty('conflictingEntity')
                expect(conflict).toHaveProperty('severity')
            } else {
                expect(conflict).toBeNull()
            }
        })

        it('should return null for available port', async () => {
            // Use a high port number that's likely to be free
            const conflict = await portManager.checkPortConflict(65432, 'tcp')
            expect(conflict).toBeNull()
        })
    })

    describe('getPortManagementStats', () => {
        it('should return port statistics', async () => {
            const stats = await portManager.getPortManagementStats()
            expect(stats).toHaveProperty('totalPorts')
            expect(stats).toHaveProperty('usedPorts')
            expect(stats).toHaveProperty('availablePorts')
            expect(stats).toHaveProperty('containerPorts')
            expect(stats).toHaveProperty('systemPorts')
            expect(stats).toHaveProperty('lastScan')
            expect(typeof stats.totalPorts).toBe('number')
            expect(typeof stats.usedPorts).toBe('number')
            expect(typeof stats.availablePorts).toBe('number')
        })
    })
})
