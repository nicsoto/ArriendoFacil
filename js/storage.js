/**
 * STORAGE.JS
 * Manejo de LocalStorage para persistencia de datos
 */

const Storage = {
    // Claves de almacenamiento
    KEYS: {
        PROPERTIES: 'platita_properties',
        CONTRACTS: 'platita_contracts',
        PAYMENTS: 'platita_payments',
        SETTINGS: 'platita_settings'
    },

    /**
     * Guardar datos en LocalStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    },

    /**
     * Cargar datos desde LocalStorage
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error cargando datos:', error);
            return defaultValue;
        }
    },

    /**
     * Eliminar datos del LocalStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error eliminando datos:', error);
            return false;
        }
    },

    /**
     * Limpiar todos los datos de la aplicación
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // === PROPIEDADES ===
    getProperties() {
        return this.load(this.KEYS.PROPERTIES, []);
    },

    saveProperties(properties) {
        return this.save(this.KEYS.PROPERTIES, properties);
    },

    addProperty(property) {
        const properties = this.getProperties();
        const newProperty = {
            id: this.generateId(),
            ...property,
            createdAt: new Date().toISOString()
        };
        properties.push(newProperty);
        this.saveProperties(properties);

        // Sincronizar con Firebase si está disponible
        if (typeof FirebaseService !== 'undefined' && FirebaseService.currentUser) {
            FirebaseService.saveDocument('properties', newProperty.id, newProperty);
        }

        return newProperty;
    },

    updateProperty(id, updates) {
        const properties = this.getProperties();
        const index = properties.findIndex(p => p.id === id);
        if (index !== -1) {
            properties[index] = { ...properties[index], ...updates };
            this.saveProperties(properties);
            return properties[index];
        }
        return null;
    },

    deleteProperty(id) {
        const properties = this.getProperties();
        const filtered = properties.filter(p => p.id !== id);
        this.saveProperties(filtered);

        // Sincronizar con Firebase
        if (typeof FirebaseService !== 'undefined' && FirebaseService.currentUser) {
            FirebaseService.deleteDocument('properties', id);
        }

        return filtered.length !== properties.length;
    },

    // === CONTRATOS ===
    getContracts() {
        return this.load(this.KEYS.CONTRACTS, []);
    },

    saveContracts(contracts) {
        return this.save(this.KEYS.CONTRACTS, contracts);
    },

    addContract(contract) {
        const contracts = this.getContracts();
        const newContract = {
            id: this.generateId(),
            ...contract,
            createdAt: new Date().toISOString()
        };
        contracts.push(newContract);
        this.saveContracts(contracts);

        // Sincronizar con Firebase
        if (typeof FirebaseService !== 'undefined' && FirebaseService.currentUser) {
            FirebaseService.saveDocument('contracts', newContract.id, newContract);
        }

        return newContract;
    },

    updateContract(id, updates) {
        const contracts = this.getContracts();
        const index = contracts.findIndex(c => c.id === id);
        if (index !== -1) {
            contracts[index] = { ...contracts[index], ...updates };
            this.saveContracts(contracts);
            return contracts[index];
        }
        return null;
    },

    deleteContract(id) {
        const contracts = this.getContracts();
        const filtered = contracts.filter(c => c.id !== id);
        this.saveContracts(filtered);

        // Sincronizar con Firebase
        if (typeof FirebaseService !== 'undefined' && FirebaseService.currentUser) {
            FirebaseService.deleteDocument('contracts', id);
        }

        return filtered.length !== contracts.length;
    },

    getActiveContracts() {
        return this.getContracts().filter(c => c.status === 'active');
    },

    getContractsByProperty(propertyId) {
        return this.getContracts().filter(c => c.propertyId === propertyId);
    },

    // === PAGOS ===
    getPayments() {
        return this.load(this.KEYS.PAYMENTS, []);
    },

    savePayments(payments) {
        return this.save(this.KEYS.PAYMENTS, payments);
    },

    addPayment(payment) {
        const payments = this.getPayments();
        const newPayment = {
            id: this.generateId(),
            ...payment,
            createdAt: new Date().toISOString()
        };
        payments.push(newPayment);
        this.savePayments(payments);

        // Sincronizar con Firebase
        if (typeof FirebaseService !== 'undefined' && FirebaseService.currentUser) {
            FirebaseService.saveDocument('payments', newPayment.id, newPayment);
        }

        return newPayment;
    },

    updatePayment(id, updates) {
        const payments = this.getPayments();
        const index = payments.findIndex(p => p.id === id);
        if (index !== -1) {
            payments[index] = { ...payments[index], ...updates };
            this.savePayments(payments);
            return payments[index];
        }
        return null;
    },

    getPaymentsByContract(contractId) {
        return this.getPayments().filter(p => p.contractId === contractId);
    },

    // === CONFIGURACIÓN ===
    getSettings() {
        return this.load(this.KEYS.SETTINGS, {
            theme: 'light',
            notifications: true
        });
    },

    saveSettings(settings) {
        return this.save(this.KEYS.SETTINGS, settings);
    },

    // === UTILIDADES ===
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Exportar todos los datos como JSON
     */
    exportData() {
        return {
            properties: this.getProperties(),
            contracts: this.getContracts(),
            payments: this.getPayments(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Importar datos desde JSON
     */
    importData(data) {
        try {
            if (data.properties) this.saveProperties(data.properties);
            if (data.contracts) this.saveContracts(data.contracts);
            if (data.payments) this.savePayments(data.payments);
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch (error) {
            console.error('Error importando datos:', error);
            return false;
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
