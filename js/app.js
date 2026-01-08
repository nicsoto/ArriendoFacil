/**
 * APP.JS
 * Aplicación principal - Controlador y enrutamiento
 */

const App = {
    currentView: 'dashboard',
    currentLandlord: null,

    /**
     * Inicializar aplicación
     */
    init() {
        console.log('🏠 ArriendoFácil - Iniciando aplicación...');

        // Inicializar Firebase (si está configurado)
        if (typeof FirebaseService !== 'undefined') {
            FirebaseService.init();
        }

        // Cargar configuración del arrendador
        this.loadLandlordInfo();

        // Configurar enrutamiento
        this.setupRouting();

        // Renderizar vista inicial
        this.navigate(window.location.hash.slice(1) || 'dashboard');

        // Configurar event listeners globales
        this.setupEventListeners();

        console.log('✅ Aplicación lista');
    },

    /**
     * Cargar información del arrendador
     */
    loadLandlordInfo() {
        const settings = Storage.getSettings();
        this.currentLandlord = settings.landlord || {
            name: 'Usuario',
            rut: '',
            email: '',
            phone: '',
            address: '',
            city: 'Santiago'
        };
    },

    /**
     * Configurar enrutamiento
     */
    setupRouting() {
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.slice(1);
            this.navigate(route || 'dashboard');
        });
    },

    /**
     * Navegar a una vista
     */
    navigate(route) {
        this.currentView = route;

        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            }
        });

        // Renderizar vista
        this.renderView(route);
    },

    /**
     * Renderizar vista según la ruta
     */
    renderView(route) {
        const mainContent = document.getElementById('main-content');

        switch (route) {
            case 'dashboard':
                mainContent.innerHTML = Views.renderDashboard();
                break;
            case 'properties':
                mainContent.innerHTML = Views.renderProperties();
                break;
            case 'contracts':
                mainContent.innerHTML = Views.renderContracts();
                break;
            case 'payments':
                mainContent.innerHTML = Views.renderPayments();
                break;
            case 'calculator':
                mainContent.innerHTML = Views.renderCalculator();
                break;
            case 'documents':
                mainContent.innerHTML = Views.renderDocuments();
                break;
            case 'taxes':
                mainContent.innerHTML = Views.renderTaxes();
                break;
            case 'settings':
                mainContent.innerHTML = Views.renderSettings();
                break;
            default:
                mainContent.innerHTML = Views.render404();
        }

        // Ejecutar inicializaciones de la vista
        this.initViewHandlers(route);
    },

    /**
     * Inicializar handlers de eventos para la vista actual
     */
    initViewHandlers(route) {
        switch (route) {
            case 'dashboard':
                this.initDashboardHandlers();
                break;
            case 'properties':
                this.initPropertiesHandlers();
                break;
            case 'contracts':
                this.initContractsHandlers();
                break;
            case 'payments':
                this.initPaymentsHandlers();
                break;
            case 'calculator':
                this.initCalculatorHandlers();
                break;
            case 'documents':
                this.initDocumentsHandlers();
                break;
            case 'taxes':
                this.initTaxesHandlers();
                break;
            case 'settings':
                this.initSettingsHandlers();
                break;
        }
    },

    /**
     * Configurar event listeners globales
     */
    setupEventListeners() {
        // Tema oscuro/claro
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    },

    /**
     * Alternar tema
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);

        const settings = Storage.getSettings();
        settings.theme = newTheme;
        Storage.saveSettings(settings);
    },

    // === HANDLERS POR VISTA ===

    initDashboardHandlers() {
        // Actualizar alertas
        this.updateAlertBadge();
    },

    initPropertiesHandlers() {
        // Botón agregar propiedad
        const addBtn = document.getElementById('add-property-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddPropertyModal());
        }
    },

    initContractsHandlers() {
        // Botón agregar contrato
        const addBtn = document.getElementById('add-contract-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddContractModal());
        }

        // Botones ver contrato
        document.querySelectorAll('.generate-contract-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contractId = e.target.dataset.contractId;
                this.generateContract(contractId);
            });
        });
    },

    initPaymentsHandlers() {
        // Exportar CSV
        const exportBtn = document.getElementById('export-payments-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const payments = Storage.getPayments();
                Payments.downloadCSV(payments);
            });
        }
    },

    initCalculatorHandlers() {
        // Formulario de cálculo IPC
        const ipcForm = document.getElementById('ipc-calculator-form');
        if (ipcForm) {
            ipcForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.calculateIPC();
            });
        }

        // Establecer valores predeterminados para los selectores
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        // Fecha inicio: hace un año, mismo mes
        const startMonthSelect = document.getElementById('ipc-start-month');
        const startYearSelect = document.getElementById('ipc-start-year');
        if (startMonthSelect) startMonthSelect.value = currentMonth;
        if (startYearSelect) startYearSelect.value = currentYear - 1;

        // Fecha fin: mes y año actual
        const endMonthSelect = document.getElementById('ipc-end-month');
        const endYearSelect = document.getElementById('ipc-end-year');
        if (endMonthSelect) endMonthSelect.value = currentMonth;
        if (endYearSelect) endYearSelect.value = currentYear;
    },

    initDocumentsHandlers() {
        // Botones de generación de contratos
        document.querySelectorAll('.generate-contract-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const contractId = btn.dataset.contractId;
                this.generateContract(contractId);
            });
        });

        // Botones de anexos y cartas
        document.querySelectorAll('[data-doc-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const contractId = btn.dataset.contractId;
                const docType = btn.dataset.docType;

                if (docType === 'annex') {
                    this.generateAnnex(contractId);
                } else if (docType === 'termination') {
                    this.generateTermination(contractId);
                }
            });
        });
    },

    initTaxesHandlers() {
        // Exportar resumen tributario
        const exportBtn = document.getElementById('export-tax-summary-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const year = new Date().getFullYear();
                Taxes.downloadTaxSummary(year);
            });
        }
    },

    initSettingsHandlers() {
        // Formulario de configuración
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Exportar datos
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Importar datos
        const importBtn = document.getElementById('import-data-btn');
        const fileInput = document.getElementById('import-file-input');

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importData(file);
                }
            });
        }
    },

    // === ACCIONES ===

    async calculateIPC() {
        const amount = parseFloat(document.getElementById('ipc-amount').value);
        const startMonth = document.getElementById('ipc-start-month').value;
        const startYear = document.getElementById('ipc-start-year').value;
        const endMonth = document.getElementById('ipc-end-month').value;
        const endYear = document.getElementById('ipc-end-year').value;

        // Construir fechas en formato YYYY-MM-DD
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

        const resultDiv = document.getElementById('ipc-result');
        resultDiv.innerHTML = '<p>Calculando...</p>';

        try {
            const result = await Calculator.calculateIPCAdjustment(amount, startDate, endDate);

            resultDiv.innerHTML = `
        <div class="card">
          <h3>Resultado del Reajuste</h3>
          <table class="table">
            <tr><td>Período:</td><td>${result.startDate} - ${result.endDate}</td></tr>
            <tr><td>Meses calculados:</td><td>${result.monthsCount}</td></tr>
            <tr><td>Monto Original:</td><td>${Calculator.formatCLP(result.originalAmount)}</td></tr>
            <tr><td>Variación IPC Acumulada:</td><td>${Calculator.formatPercent(result.variation)}</td></tr>
            <tr style="font-weight: bold; font-size: 1.1rem; background: var(--color-bg-tertiary);">
              <td>Nuevo Monto:</td>
              <td>${Calculator.formatCLP(result.newAmount)}</td>
            </tr>
            <tr><td>Diferencia:</td><td>${Calculator.formatCLP(result.newAmount - result.originalAmount)}</td></tr>
          </table>
        </div>
      `;
        } catch (error) {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    },

    generateContract(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;

        const property = Storage.getProperties().find(p => p.id === contract.propertyId);
        const html = Contracts.generateLeaseContract(contract, property, this.currentLandlord);
        Contracts.openDocument(html);
    },

    showAddPropertyModal() {
        Modals.showAddPropertyModal();
    },

    showAddContractModal() {
        Modals.showAddContractModal();
    },

    saveSettings() {
        const landlord = {
            name: document.getElementById('landlord-name').value,
            rut: document.getElementById('landlord-rut').value,
            email: document.getElementById('landlord-email').value,
            phone: document.getElementById('landlord-phone').value,
            address: document.getElementById('landlord-address').value,
            city: document.getElementById('landlord-city').value
        };

        const settings = Storage.getSettings();
        settings.landlord = landlord;
        Storage.saveSettings(settings);

        this.currentLandlord = landlord;
        alert('Configuración guardada correctamente');
    },

    exportData() {
        const data = Storage.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `arriendofacil-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        Modals.showToast('✅ Datos exportados correctamente', 'success');
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validar estructura básica
                if (!data.properties || !data.contracts || !data.payments) {
                    throw new Error('Archivo inválido: estructura incorrecta');
                }

                // Confirmar con el usuario
                if (confirm('¿Estás seguro de que deseas importar estos datos? Esto reemplazará todos los datos actuales.')) {
                    Storage.importData(data);
                    this.navigate('dashboard');
                    Modals.showToast('✅ Datos importados correctamente', 'success');

                    // Recargar para refrescar toda la UI
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (error) {
                alert('Error al importar datos: ' + error.message);
            }
        };
        reader.readAsText(file);
    },

    generateAnnex(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;

        const property = Storage.getProperties().find(p => p.id === contract.propertyId);

        // Solicitar nuevo monto
        const newAmountStr = prompt(`Ingresa el nuevo monto de arriendo (actual: ${Calculator.formatCLP(contract.monthlyRent)}):`);
        if (!newAmountStr) return;

        const newAmount = parseInt(newAmountStr);
        if (isNaN(newAmount) || newAmount <= 0) {
            alert('Monto inválido');
            return;
        }

        const html = Contracts.generateAdjustmentAnnex(contract, property, newAmount, this.currentLandlord);
        Contracts.openDocument(html);
    },

    generateTermination(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;

        const property = Storage.getProperties().find(p => p.id === contract.propertyId);
        const html = Contracts.generateTerminationLetter(contract, property, this.currentLandlord);
        Contracts.openDocument(html);
    },

    updateAlertBadge() {
        const counts = Alerts.getAlertCounts();
        const badge = document.getElementById('alerts-badge');
        if (badge) {
            if (counts.total > 0) {
                badge.textContent = counts.total;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
