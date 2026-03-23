import express = require('express')
import ApiStatusCodes from '../../../api/ApiStatusCodes'
import BaseApi from '../../../api/BaseApi'
import DockerApi from '../../../docker/DockerApi'
import PortManager from '../../../user/PortManager'

const router = express.Router()

// Get all port information
router.get('/scan', function (req, res, next) {
    // Create PortManager instance
    const portManager = new PortManager(DockerApi.get())

    const options: any = {
        portRange: req.query.portRange
            ? {
                  start: parseInt(req.query.start as string) || 1,
                  end: parseInt(req.query.end as string) || 65535,
              }
            : undefined,
        protocols: req.query.protocols
            ? ((req.query.protocols as string)
                  .split(',')
                  .map((p: string) => p.trim().toLowerCase()) as (
                  | 'tcp'
                  | 'udp'
              )[])
            : ['tcp'],
        includeContainers: req.query.includeContainers !== 'false',
        includeSystemProcesses: req.query.includeSystemProcesses !== 'false',
        timeout: req.query.timeout
            ? parseInt(req.query.timeout as string)
            : 1000,
    }

    return portManager
        .scanPorts(options)
        .then(function (ports) {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Port scan completed successfully'
            )
            baseApi.data = { ports }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Get port management statistics
router.get('/stats', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())

    return portManager
        .getPortManagementStats()
        .then(function (stats) {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Port statistics retrieved successfully'
            )
            baseApi.data = { stats }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Get port suggestions
router.get('/suggest', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())

    const count = parseInt(req.query.count as string) || 1
    const preferredRange =
        req.query.start && req.query.end
            ? {
                  start: parseInt(req.query.start as string),
                  end: parseInt(req.query.end as string),
              }
            : undefined

    return portManager
        .suggestAvailablePorts(count, preferredRange)
        .then(function (suggestions) {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Port suggestions generated successfully'
            )
            baseApi.data = { suggestions }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Check for port conflicts
router.get('/conflict/:port', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const port = parseInt(req.params.port)
    const protocol = (req.query.protocol as string) || 'tcp'

    return portManager
        .checkPortConflict(port, protocol as 'tcp' | 'udp')
        .then(function (conflict) {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                conflict ? 'Port conflict detected' : 'No port conflict'
            )
            baseApi.data = { conflict }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Kill a process
router.post('/kill', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const pid = req.body.pid
    const signal = req.body.signal || 9

    if (!pid) {
        const response = new BaseApi(
            ApiStatusCodes.STATUS_ERROR_GENERIC,
            'PID is required'
        )
        res.send(response)
        return
    }

    return portManager
        .killProcess(pid, signal)
        .then(function () {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                `Process ${pid} killed successfully`
            )
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Stop a container
router.post('/stop-container', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const containerId = req.body.containerId

    if (!containerId) {
        const response = new BaseApi(
            ApiStatusCodes.STATUS_ERROR_GENERIC,
            'Container ID is required'
        )
        res.send(response)
        return
    }

    return portManager
        .stopContainer(containerId)
        .then(function () {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                `Container ${containerId} stopped successfully`
            )
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Get containers by port
router.get('/containers/:port', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const port = parseInt(req.params.port)

    return portManager
        .getContainersByPort(port)
        .then(function (containers) {
            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Containers retrieved successfully'
            )
            baseApi.data = { containers }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Get port suggestions for new app
router.get('/suggest-for-app', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const preferredPort = req.query.preferredPort
        ? parseInt(req.query.preferredPort as string)
        : undefined
    const count = parseInt(req.query.count as string) || 3

    return portManager
        .suggestAvailablePorts(
            count,
            preferredPort
                ? {
                      start: Math.max(3000, preferredPort - 100),
                      end: Math.min(9000, preferredPort + 100),
                  }
                : undefined
        )
        .then(function (suggestions) {
            // Check for preferred port conflict
            const conflict = null
            if (preferredPort) {
                return portManager
                    .checkPortConflict(preferredPort, 'tcp')
                    .then(function (preferredConflict) {
                        const baseApi = new BaseApi(
                            ApiStatusCodes.STATUS_OK,
                            'Port suggestions generated successfully'
                        )
                        baseApi.data = {
                            suggestions,
                            conflict: preferredConflict,
                        }
                        res.send(baseApi)
                    })
            }

            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Port suggestions generated successfully'
            )
            baseApi.data = { suggestions, conflict }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

// Validate port for new app
router.post('/validate', function (req, res, next) {
    const portManager = new PortManager(DockerApi.get())
    const port = req.body.port
    const protocol = (req.body.protocol as string) || 'tcp'

    if (!port) {
        const response = new BaseApi(
            ApiStatusCodes.STATUS_ERROR_GENERIC,
            'Port is required'
        )
        res.send(response)
        return
    }

    return portManager
        .checkPortConflict(port, protocol as 'tcp' | 'udp')
        .then(function (conflict) {
            if (conflict) {
                // Get alternative ports
                return portManager
                    .suggestAvailablePorts(5, {
                        start: Math.max(3000, port - 50),
                        end: Math.min(9000, port + 50),
                    })
                    .then(function (alternatives) {
                        const baseApi = new BaseApi(
                            ApiStatusCodes.STATUS_ERROR_GENERIC,
                            'Port conflict detected'
                        )
                        baseApi.data = {
                            isValid: false,
                            conflict,
                            alternatives,
                        }
                        res.send(baseApi)
                    })
            }

            const baseApi = new BaseApi(
                ApiStatusCodes.STATUS_OK,
                'Port is available'
            )
            baseApi.data = { isValid: true }
            res.send(baseApi)
        })
        .catch(ApiStatusCodes.createCatcher(res))
})

export default router
