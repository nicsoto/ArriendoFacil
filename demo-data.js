/**
 * DEMO DATA
 * Datos de demostración para pruebas
 */

// Ejecutar esto en la consola del navegador para cargar datos de prueba

// 1. Agregar propiedades
const demoProperties = [
    {
        type: 'departamento',
        address: 'Av. Providencia 1234, Depto 501',
        size: 65,
        isDFL2: true
    },
    {
        type: 'casa',
        address: 'Los Aromos 567, La Florida',
        size: 120,
        isDFL2: true
    },
    {
        type: 'departamento',
        address: 'Av. Italia 890, Depto 302',
        size: 55,
        isDFL2: true
    }
];

demoProperties.forEach(prop => {
    Storage.addProperty(prop);
});

console.log('✅ Propiedades agregadas');

// 2. Agregar contratos
const properties = Storage.getProperties();

const demoContracts = [
    {
        propertyId: properties[0].id,
        tenant: {
            name: 'María González',
            rut: '12.345.678-9',
            email: 'maria@ejemplo.com',
            phone: '+56912345678',
            address: 'Av. Providencia 1234, Depto 501'
        },
        guarantor: {
            name: 'Pedro González',
            rut: '98.765.432-1',
            email: 'pedro@ejemplo.com',
            phone: '+56987654321',
            address: 'San Diego 456'
        },
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        monthlyRent: 450000,
        currency: 'CLP',
        adjustmentType: 'IPC',
        deposit: 450000,
        status: 'active'
    },
    {
        propertyId: properties[1].id,
        tenant: {
            name: 'Carlos Ramírez',
            rut: '11.222.333-4',
            email: 'carlos@ejemplo.com',
            phone: '+56911222333',
            address: 'Los Aromos 567'
        },
        guarantor: null,
        startDate: '2024-06-01',
        endDate: '2025-06-01',
        monthlyRent: 650000,
        currency: 'CLP',
        adjustmentType: 'UF',
        deposit: 650000,
        status: 'active'
    }
];

demoContracts.forEach(contract => {
    const newContract = Storage.addContract(contract);
    // Generar pagos para el contrato
    const payments = Payments.generateMonthlyPayments(newContract);
    payments.forEach(payment => {
        Storage.addPayment(payment);
    });
});

console.log('✅ Contratos y pagos agregados');

// 3. Marcar algunos pagos como pagados
const allPayments = Storage.getPayments();
const paymentsToMarkPaid = allPayments.slice(0, Math.floor(allPayments.length * 0.7));

paymentsToMarkPaid.forEach(payment => {
    Storage.updatePayment(payment.id, {
        status: 'paid',
        paidDate: payment.dueDate
    });
});

console.log('✅ Pagos marcados como pagados');

// 4. Configurar información del arrendador
Storage.saveSettings({
    theme: 'light',
    notifications: true,
    landlord: {
        name: 'Juan Pérez Silva',
        rut: '15.678.901-2',
        email: 'juan.perez@ejemplo.com',
        phone: '+56915678901',
        address: 'Av. Libertador Bernardo O\'Higgins 1350',
        city: 'Santiago'
    }
});

console.log('✅ Configuración del arrendador guardada');

console.log('🎉 Datos de demostración cargados correctamente');
console.log('📊 Resumen:');
console.log('- Propiedades:', Storage.getProperties().length);
console.log('- Contratos:', Storage.getContracts().length);
console.log('- Pagos:', Storage.getPayments().length);
console.log('\n🔄 Recarga la página para ver los datos');
