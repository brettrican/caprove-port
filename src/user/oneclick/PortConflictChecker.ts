import AppsDataStore from "../../datastore/AppsDataStore";

export interface IPortConflict {
    port: number;
    conflictingAppName: string;
    serviceName: string;
}

export default class PortConflictChecker {
    constructor(private appsDataStore: AppsDataStore) {}

    async checkConflicts(renderedServices: any): Promise<IPortConflict[]> {
        const allApps = await this.appsDataStore.getAppDefinitions();
        const occupiedPorts: { [port: number]: string } = {};

        Object.keys(allApps).forEach((appName) => {
            const app = allApps[appName];
            if (app.ports) {
                app.ports.forEach((p: any) => {
                    if (p.hostPort) {
                        occupiedPorts[p.hostPort] = appName;
                    }
                });
            }
        });

        const conflicts: IPortConflict[] = [];

        for (const serviceName in renderedServices) {
            const service = renderedServices[serviceName];
            if (service.ports) {
                service.ports.forEach((portMapping: string) => {
                    const hostPortStr = portMapping.split(":")[0];
                    const hostPort = parseInt(hostPortStr);

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

        return conflicts;
    }

    async findNextAvailablePort(startPort: number): Promise<number> {
        const allApps = await this.appsDataStore.getAppDefinitions();
        const occupiedPorts = new Set<number>();

        Object.keys(allApps).forEach((appName) => {
            const app = allApps[appName];
            if (app.ports) {
                app.ports.forEach((p: any) => {
                    if (p.hostPort) occupiedPorts.add(p.hostPort);
                });
            }
        });

        let port = startPort;
        while (occupiedPorts.has(port)) {
            port++;
        }
        return port;
    }
}
