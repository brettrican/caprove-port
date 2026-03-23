import getPortManagerSingleton from '../../../../user/PortManagerSingleton'
import Logger from '../../../../utils/Logger'

export async function validatePortForNewApp(
    port: number,
    protocol: string = 'tcp'
) {
    try {
        const portManager = getPortManagerSingleton()
        const conflict = await portManager.checkPortConflict(port, protocol as 'tcp' | 'udp')

        if (conflict) {
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
