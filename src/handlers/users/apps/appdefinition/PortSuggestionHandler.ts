import DockerApi from '../../../../docker/DockerApi'
import PortManager from '../../../../user/PortManager'
import Logger from '../../../../utils/Logger'

export async function getPortSuggestionsForNewApp(
    preferredPort?: number,
    count: number = 3
): Promise<{ suggestions: any[]; conflict?: any }> {
    try {
        const portManager = new PortManager(DockerApi.get())

        // If preferred port is provided, check for conflicts first
        if (preferredPort) {
            const conflict = await portManager.checkPortConflict(
                preferredPort,
                'tcp'
            )
            if (conflict) {
                // If there's a conflict, get alternative suggestions
                const suggestions = await portManager.suggestAvailablePorts(
                    count,
                    {
                        start: Math.max(3000, preferredPort - 100),
                        end: Math.min(9000, preferredPort + 100),
                    }
                )

                return {
                    suggestions,
                    conflict,
                }
            }
        }

        // Get general suggestions
        const suggestions = await portManager.suggestAvailablePorts(count)

        return { suggestions }
    } catch (error) {
        Logger.e('Error getting port suggestions for new app:', error)
        throw error
    }
}

export async function validatePortForNewApp(
    port: number,
    protocol: 'tcp' | 'udp' = 'tcp'
): Promise<{ isValid: boolean; conflict?: any; alternatives?: any[] }> {
    try {
        const portManager = new PortManager(DockerApi.get())
        const conflict = await portManager.checkPortConflict(port, protocol)

        if (conflict) {
            // Get alternative ports
            const alternatives = await portManager.suggestAvailablePorts(5, {
                start: Math.max(3000, port - 50),
                end: Math.min(9000, port + 50),
            })

            return {
                isValid: false,
                conflict,
                alternatives,
            }
        }

        return { isValid: true }
    } catch (error) {
        Logger.e('Error validating port for new app:', error)
        throw error
    }
}
