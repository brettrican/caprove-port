import AppsDataStore from "../../datastore/AppsDataStore";
import Logger from "../../utils/Logger";

export interface IPortConflict {
    port: number;
    conflictingAppName: string;
    serviceName: string;
}

export default class PortConflictChecker {
    constructor(private appsDataStore: AppsDataStore) {}

    async checkConflicts(renderedServices: any): Promise<IPortConflict[]> {
        const conflicts: IPortConflict[] = [];
        try {
            const allApps = await this.appsDataStore.getAppDefinitions();
            const occupiedPorts: { [port: number]: string } = {};

            if (allApps) {
                Object.keys(allApps).forEach((appName) => {
                    const app = allApps[appName];
                    // Defensive check: ensure app and ports exist and ports is an array
                    if (app && app.ports && Array.isArray(app.ports)) {
                        app.ports.forEach((p: any) => {
                            if (p && p.hostPort) {
                                occupiedPorts[Number(p.hostPort)] = appName;
                            }
                        });
                    }
                });
            }

            if (renderedServices) {
                for (const serviceName in renderedServices) {
                    const service = renderedServices[serviceName];
                    if (service && service.ports && Array.isArray(service.ports)) {
                        service.ports.forEach((portMapping: any) => {
                            // handle both string "80:80" and object formats
                            const hostPortStr = typeof portMapping === "string" 
                                ? portMapping.split(":")[0] 
                                : portMapping.hostPort;
                            
                            const hostPort = parseInt(String(hostPortStr));

                            if (!isNaN(hostPort) && occupiedPorts[hostPort]) {
                                conflicts.push({
                                    port: hostPort,
                                    conflictingAppName: occupiedPorts[hostPort],
                                    serviceName: serviceName,
                                });
                            }
                        });
                    }
                }
            }
        } catch (e) {
            Logger.e("Error during Port Conflict Check: " + e);
        }

        return conflicts;
    }

    async findNextAvailablePort(startPort: number): Promise<number> {
        let port = startPort;
        try {
            const allApps = await this.appsDataStore.getAppDefinitions();
            const occupiedPorts = new Set<number>();

            if (allApps) {
                Object.keys(allApps).forEach((appName) => {
                    const app = allApps[appName];
                    if (app && app.ports && Array.isArray(app.ports)) {
                        app.ports.forEach((p: any) => {
                            if (p && p.hostPort) occupiedPorts.add(Number(p.hostPort));
                        });
                    }
                });
            }

            while (occupiedPorts.has(port)) {
                port++;
            }
        } catch (e) {
            Logger.e("Error finding next available port: " + e);
        }
        return port;
    }
}
