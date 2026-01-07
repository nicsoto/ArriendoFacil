/**
 * ALERTS.JS
 * Sistema de alertas y recordatorios
 */

const Alerts = {
    /**
     * Obtener todas las alertas activas
     */
    getAllAlerts() {
        const alerts = [];

        // Alertas de pagos atrasados
        const latePayments = Payments.getAllLatePayments();
        latePayments.forEach(payment => {
            alerts.push({
                id: `late-payment-${payment.id}`,
                type: 'late-payment',
                severity: payment.daysLate > 10 ? 'danger' : 'warning',
                title: 'Pago Atrasado',
                message: `El arriendo de ${payment.property?.address} tiene ${payment.daysLate} días de atraso`,
                data: payment,
                actions: [
                    {
                        label: 'Enviar recordatorio',
                        action: 'sendReminder',
                        params: { paymentId: payment.id }
                    },
                    {
                        label: 'Registrar pago',
                        action: 'recordPayment',
                        params: { paymentId: payment.id }
                    }
                ]
            });
        });

        // Alertas de contratos próximos a vencer
        const expiringContracts = this.getExpiringContracts();
        expiringContracts.forEach(contract => {
            const property = Storage.getProperties().find(p => p.id === contract.propertyId);
            const daysUntilExpiry = this.getDaysUntilExpiry(contract.endDate);

            alerts.push({
                id: `expiring-contract-${contract.id}`,
                type: 'expiring-contract',
                severity: daysUntilExpiry <= 15 ? 'warning' : 'info',
                title: 'Contrato Próximo a Vencer',
                message: `El contrato de ${property?.address} vence en ${daysUntilExpiry} días`,
                data: { contract, property },
                actions: [
                    {
                        label: 'Generar carta de término',
                        action: 'generateTermination',
                        params: { contractId: contract.id }
                    },
                    {
                        label: 'Renovar contrato',
                        action: 'renewContract',
                        params: { contractId: contract.id }
                    }
                ]
            });
        });

        // Alertas de reajustes pendientes
        const pendingAdjustments = this.getPendingAdjustments();
        pendingAdjustments.forEach(item => {
            const property = Storage.getProperties().find(p => p.id === item.contract.propertyId);

            alerts.push({
                id: `pending-adjustment-${item.contract.id}`,
                type: 'pending-adjustment',
                severity: 'info',
                title: 'Reajuste Pendiente',
                message: `El contrato de ${property?.address} requiere reajuste anual`,
                data: { ...item, property },
                actions: [
                    {
                        label: 'Calcular reajuste',
                        action: 'calculateAdjustment',
                        params: { contractId: item.contract.id }
                    },
                    {
                        label: 'Generar anexo',
                        action: 'generateAnnex',
                        params: { contractId: item.contract.id }
                    }
                ]
            });
        });

        // Ordenar por severidad
        const severityOrder = { danger: 0, warning: 1, info: 2 };
        alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return alerts;
    },

    /**
     * Obtener contratos próximos a vencer (30 días o menos)
     */
    getExpiringContracts() {
        const contracts = Storage.getActiveContracts();
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        return contracts.filter(contract => {
            const endDate = new Date(contract.endDate);
            return endDate <= thirtyDaysFromNow && endDate >= today;
        });
    },

    /**
     * Obtener días hasta expiración
     */
    getDaysUntilExpiry(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Obtener contratos con reajuste pendiente
     */
    getPendingAdjustments() {
        const contracts = Storage.getActiveContracts();
        const pendingAdjustments = [];

        contracts.forEach(contract => {
            if (contract.adjustmentType === 'fixed') return;

            const anniversaryDate = this.getAnniversaryDate(contract.startDate);
            const daysSinceAnniversary = this.getDaysSinceDate(anniversaryDate);

            // Si el aniversario fue hace menos de 30 días y no se ha aplicado reajuste
            if (daysSinceAnniversary >= 0 && daysSinceAnniversary <= 30) {
                // Verificar si ya se aplicó el reajuste (simplificado)
                pendingAdjustments.push({
                    contract,
                    anniversaryDate,
                    daysSinceAnniversary
                });
            }
        });

        return pendingAdjustments;
    },

    /**
     * Obtener fecha de aniversario del contrato (1 año después)
     */
    getAnniversaryDate(startDate) {
        const date = new Date(startDate);
        date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().split('T')[0];
    },

    /**
     * Obtener días desde una fecha
     */
    getDaysSinceDate(date) {
        const today = new Date();
        const pastDate = new Date(date);
        const diffTime = today - pastDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Generar texto de recordatorio de pago
     */
    generatePaymentReminder(payment) {
        const contract = Storage.getContracts().find(c => c.id === payment.contractId);
        const property = contract ? Storage.getProperties().find(p => p.id === contract.propertyId) : null;
        const status = Payments.getPaymentStatus(payment);

        const subject = `Recordatorio: Pago de arriendo ${payment.month}`;
        const body = `Estimado(a) ${contract?.tenant?.name}:

Por medio del presente, le recordamos que el pago del arriendo correspondiente al mes de ${this.formatMonth(payment.month)} se encuentra ${status.label.toLowerCase()}.

Detalles del pago:
- Propiedad: ${property?.address}
- Monto: ${Calculator.formatCLP(payment.amount)}
- Fecha de vencimiento: ${this.formatDate(payment.dueDate)}
${status.daysLate > 0 ? `- Días de atraso: ${status.daysLate}` : ''}

Por favor, regularice su situación a la brevedad.

Saludos cordiales.`;

        return { subject, body };
    },

    /**
     * Abrir cliente de correo con recordatorio
     */
    sendPaymentReminder(payment) {
        const contract = Storage.getContracts().find(c => c.id === payment.contractId);
        const { subject, body } = this.generatePaymentReminder(payment);

        const mailtoLink = `mailto:${contract?.tenant?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    },

    /**
     * Obtener contador de alertas por tipo
     */
    getAlertCounts() {
        const alerts = this.getAllAlerts();

        return {
            total: alerts.length,
            danger: alerts.filter(a => a.severity === 'danger').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            info: alerts.filter(a => a.severity === 'info').length,
            byType: {
                latePayments: alerts.filter(a => a.type === 'late-payment').length,
                expiringContracts: alerts.filter(a => a.type === 'expiring-contract').length,
                pendingAdjustments: alerts.filter(a => a.type === 'pending-adjustment').length
            }
        };
    },

    // === UTILIDADES ===

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatMonth(monthStr) {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long'
        });
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Alerts;
}
