/**
 * Port Validation Component for CapRover App Deployment
 * Provides port conflict detection, suggestions, and management
 */

class PortValidationComponent {
    constructor() {
        this.ports = [];
        this.conflicts = [];
        this.suggestions = [];
        this.isValidationInProgress = false;
        this.init();
    }

    init() {
        this.createPortValidationUI();
        this.bindEvents();
        this.loadExistingPorts();
    }

    createPortValidationUI() {
        // Find the deployment form or create container for port validation
        const deploymentForm = document.querySelector('form[action*="/appdefinitions"]') || 
                              document.querySelector('.app-deployment-form') ||
                              document.querySelector('form');

        if (!deploymentForm) {
            console.warn('Deployment form not found. Port validation will not be available.');
            return;
        }

        // Create port validation section
        const portSection = document.createElement('div');
        portSection.id = 'port-validation-section';
        portSection.className = 'port-validation-section';
        portSection.innerHTML = `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-network-wired me-2"></i>
                        Port Configuration
                    </h5>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="validate-ports-btn">
                        <i class="fas fa-check-circle me-1"></i>
                        Validate Ports
                    </button>
                </div>
                <div class="card-body">
                    <div id="port-list" class="mb-3">
                        <!-- Port entries will be added here -->
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="add-port-btn">
                        <i class="fas fa-plus me-1"></i>
                        Add Port
                    </button>
                    
                    <div id="port-validation-results" class="mt-3" style="display: none;">
                        <!-- Validation results will appear here -->
                    </div>
                    
                    <div id="port-suggestions" class="mt-3" style="display: none;">
                        <!-- Port suggestions will appear here -->
                    </div>
                </div>
            </div>
        `;

        // Insert before the submit button or at the end of the form
        const submitButton = deploymentForm.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            submitButton.parentNode.insertBefore(portSection, submitButton);
        } else {
            deploymentForm.appendChild(portSection);
        }

        this.portSection = portSection;
    }

    bindEvents() {
        // Validate ports button
        const validateBtn = document.getElementById('validate-ports-btn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.validatePorts());
        }

        // Add port button
        const addPortBtn = document.getElementById('add-port-btn');
        if (addPortBtn) {
            addPortBtn.addEventListener('click', () => this.addPortEntry());
        }

        // Form submission validation
        const form = this.portSection.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    loadExistingPorts() {
        // Try to find existing port inputs in the form
        const form = this.portSection.closest('form');
        if (!form) return;

        const existingPortInputs = form.querySelectorAll('input[name*="port"], input[name*="Port"]');
        
        existingPortInputs.forEach((input, index) => {
            const portValue = parseInt(input.value);
            if (portValue && portValue > 0 && portValue < 65536) {
                this.ports.push({
                    id: 'existing-' + index,
                    hostPort: portValue,
                    containerPort: portValue,
                    protocol: 'tcp'
                });
            }
        });

        this.renderPortList();
    }

    addPortEntry(portData = null) {
        const port = portData || {
            id: 'port-' + Date.now(),
            hostPort: '',
            containerPort: '',
            protocol: 'tcp'
        };

        this.ports.push(port);
        this.renderPortList();
    }

    removePortEntry(portId) {
        this.ports = this.ports.filter(p => p.id !== portId);
        this.renderPortList();
    }

    renderPortList() {
        const portList = document.getElementById('port-list');
        if (!portList) return;

        portList.innerHTML = this.ports.map(port => `
            <div class="row align-items-center mb-2 port-entry" data-port-id="${port.id}">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">Host</span>
                        <input type="number" 
                               class="form-control host-port" 
                               placeholder="3000" 
                               min="1" 
                               max="65535"
                               value="${port.hostPort || ''}"
                               data-port-id="${port.id}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">Container</span>
                        <input type="number" 
                               class="form-control container-port" 
                               placeholder="3000" 
                               min="1" 
                               max="65535"
                               value="${port.containerPort || ''}"
                               data-port-id="${port.id}">
                    </div>
                </div>
                <div class="col-md-3">
                    <select class="form-select protocol" data-port-id="${port.id}">
                        <option value="tcp" ${port.protocol === 'tcp' ? 'selected' : ''}>TCP</option>
                        <option value="udp" ${port.protocol === 'udp' ? 'selected' : ''}>UDP</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-port" data-port-id="${port.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind events for new elements
        this.bindPortEntryEvents();
    }

    bindPortEntryEvents() {
        // Port input changes
        document.querySelectorAll('.host-port, .container-port, .protocol').forEach(input => {
            input.addEventListener('change', (e) => this.updatePortData(e));
        });

        // Remove port buttons
        document.querySelectorAll('.remove-port').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const portId = e.target.closest('button').dataset.portId;
                this.removePortEntry(portId);
            });
        });
    }

    updatePortData(e) {
        const portId = e.target.dataset.portId;
        const port = this.ports.find(p => p.id === portId);
        if (!port) return;

        if (e.target.classList.contains('host-port')) {
            port.hostPort = parseInt(e.target.value) || '';
        } else if (e.target.classList.contains('container-port')) {
            port.containerPort = parseInt(e.target.value) || '';
        } else if (e.target.classList.contains('protocol')) {
            port.protocol = e.target.value;
        }
    }

    async validatePorts() {
        if (this.isValidationInProgress) return;

        this.isValidationInProgress = true;
        this.showValidationLoading();

        try {
            const portsToValidate = this.ports.filter(p => p.hostPort && p.hostPort > 0);
            
            if (portsToValidate.length === 0) {
                this.showValidationResults({
                    isValid: false,
                    message: 'Please add at least one port to validate'
                });
                return;
            }

            const response = await fetch('/api/v1/user/appdefinitions/validate-ports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ports: portsToValidate
                })
            });

            const result = await response.json();
            this.showValidationResults(result.data);
            
        } catch (error) {
            console.error('Port validation failed:', error);
            this.showValidationResults({
                isValid: false,
                message: 'Port validation failed. Please try again.'
            });
        } finally {
            this.isValidationInProgress = false;
            this.hideValidationLoading();
        }
    }

    showValidationLoading() {
        const resultsDiv = document.getElementById('port-validation-results');
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span>Validating ports...</span>
                </div>
            `;
        }
    }

    hideValidationLoading() {
        // Loading will be replaced by results
    }

    showValidationResults(result) {
        const resultsDiv = document.getElementById('port-validation-results');
        if (!resultsDiv) return;

        resultsDiv.style.display = 'block';
        
        if (result.isValid) {
            resultsDiv.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>All ports are valid!</strong> No conflicts detected.
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Port conflicts detected!</strong> ${result.message || ''}
                </div>
            `;
        }

        // Show conflicts if any
        if (result.conflicts && result.conflicts.length > 0) {
            this.showConflicts(result.conflicts);
        }

        // Show suggestions if any
        if (result.suggestions && result.suggestions.length > 0) {
            this.showSuggestions(result.suggestions);
        }
    }

    showConflicts(conflicts) {
        const resultsDiv = document.getElementById('port-validation-results');
        if (!resultsDiv) return;

        const conflictsHtml = conflicts.map(conflict => `
            <div class="alert alert-danger mt-2" role="alert">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>Port ${conflict.port} (${conflict.protocol.toUpperCase()})</strong><br>
                        <small class="text-muted">
                            Conflict with: ${conflict.conflictingEntity}<br>
                            Type: ${conflict.conflictType} | Severity: ${conflict.severity}
                        </small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger resolve-conflict" 
                            data-port="${conflict.port}" data-protocol="${conflict.protocol}">
                        Resolve
                    </button>
                </div>
            </div>
        `).join('');

        resultsDiv.innerHTML += conflictsHtml;

        // Bind resolve conflict buttons
        resultsDiv.querySelectorAll('.resolve-conflict').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const port = parseInt(e.target.dataset.port);
                const protocol = e.target.dataset.protocol;
                this.resolveConflict(port, protocol);
            });
        });
    }

    showSuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('port-suggestions');
        if (!suggestionsDiv) return;

        suggestionsDiv.style.display = 'block';
        suggestionsDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-lightbulb me-2"></i>
                        Suggested Available Ports
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${suggestions.map(suggestion => `
                            <div class="col-md-4 mb-2">
                                <div class="card card-body text-center p-2 suggested-port" 
                                     data-port="${suggestion.port}" 
                                     data-confidence="${suggestion.confidence}">
                                    <h6 class="mb-1">${suggestion.port}</h6>
                                    <small class="text-muted">${suggestion.reason}</small><br>
                                    <span class="badge bg-${suggestion.confidence === 'high' ? 'success' : suggestion.confidence === 'medium' ? 'warning' : 'secondary'}">
                                        ${suggestion.confidence}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Bind suggestion clicks
        suggestionsDiv.querySelectorAll('.suggested-port').forEach(card => {
            card.addEventListener('click', (e) => {
                const port = parseInt(e.currentTarget.dataset.port);
                this.useSuggestedPort(port);
            });
            card.style.cursor = 'pointer';
        });
    }

    resolveConflict(port, protocol) {
        // Find alternatives for this port
        const conflict = this.conflicts.find(c => c.port === port && c.protocol === protocol);
        if (conflict && conflict.alternatives) {
            this.showAlternatives(port, conflict.alternatives);
        } else {
            // Get new suggestions
            this.getAlternativePorts(port);
        }
    }

    showAlternatives(originalPort, alternatives) {
        const resultsDiv = document.getElementById('port-validation-results');
        if (!resultsDiv) return;

        const alternativesHtml = `
            <div class="alert alert-info mt-2" role="alert">
                <strong>Alternative ports for ${originalPort}:</strong>
                <div class="mt-2">
                    ${alternatives.map(alt => `
                        <button type="button" class="btn btn-sm btn-outline-primary me-2 mb-1 use-alternative" 
                                data-port="${alt.port}">
                            ${alt.port} (${alt.confidence})
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        resultsDiv.innerHTML += alternativesHtml;

        // Bind alternative buttons
        resultsDiv.querySelectorAll('.use-alternative').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newPort = parseInt(e.target.dataset.port);
                this.replacePort(originalPort, newPort);
            });
        });
    }

    async getAlternativePorts(port) {
        try {
            const response = await fetch('/api/v1/user/ports/suggest-for-app?preferredPort=' + port + '&count=5');
            const result = await response.json();
            
            if (result.data && result.data.suggestions) {
                this.showAlternatives(port, result.data.suggestions);
            }
        } catch (error) {
            console.error('Failed to get alternative ports:', error);
        }
    }

    replacePort(oldPort, newPort) {
        // Update the port entry with the new port
        const portEntry = this.ports.find(p => p.hostPort === oldPort);
        if (portEntry) {
            portEntry.hostPort = newPort;
            if (!portEntry.containerPort) {
                portEntry.containerPort = newPort;
            }
            this.renderPortList();
            
            // Clear validation results
            document.getElementById('port-validation-results').style.display = 'none';
            document.getElementById('port-suggestions').style.display = 'none';
        }
    }

    useSuggestedPort(port) {
        // Add a new port entry with the suggested port
        this.addPortEntry({
            id: 'suggested-' + Date.now(),
            hostPort: port,
            containerPort: port,
            protocol: 'tcp'
        });
    }

    handleFormSubmit(e) {
        const invalidPorts = this.ports.filter(p => 
            !p.hostPort || p.hostPort < 1 || p.hostPort > 65535 ||
            !p.containerPort || p.containerPort < 1 || p.containerPort > 65535
        );

        if (invalidPorts.length > 0) {
            e.preventDefault();
            alert('Please fix invalid port numbers before submitting.');
            return;
        }

        // If there are conflicts, warn the user
        if (this.conflicts.length > 0) {
            const proceed = confirm('Port conflicts were detected. Do you want to proceed with deployment anyway?');
            if (!proceed) {
                e.preventDefault();
                return;
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PortValidationComponent());
} else {
    new PortValidationComponent();
}

// Export for potential use in other scripts
window.PortValidationComponent = PortValidationComponent;
