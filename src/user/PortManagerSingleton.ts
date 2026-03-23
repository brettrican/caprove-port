import DockerApi from '../docker/DockerApi'
import PortManager from './PortManager'

/**
 * Singleton wrapper for PortManager to prevent excessive instantiation
 * and connection leaks that cause MaxListenersExceededWarning
 */
let instance: PortManager | null = null

export function getPortManagerSingleton(): PortManager {
    if (!instance) {
        instance = new PortManager(DockerApi.get())
    }
    return instance
}

export function resetPortManager(): void {
    instance = null
}

export default getPortManagerSingleton
