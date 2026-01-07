/**
 * PAYMENTS.JS
 * Gestión de pagos y gastos
 */

const Payments = {
    /**
     * Generar pagos mensuales para un contrato
     */
    generateMonthlyPayments(contract) {
        const payments = [];
        const start = new Date(contract.startDate);
        const end = new Date(contract.endDate);

        let current = new Date(start);
        current.setDate(1); // Primer día del mes

        while (current <= end) {
            const month = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;

            payments.push({
                contractId: contract.id,
                month: month,
                amount: contract.monthlyRent,
                dueDate: this.getDueDate(current),
                paidDate: null,
                status: 'pending'
            });

            current.setMonth(current.getMonth() + 1);
        }

        return payments;
    },

    /**
     * Obtener fecha de vencimiento (día 5 del mes)
     */
    getDueDate(monthDate) {
        const date = new Date(monthDate);
        date.setDate(5);
        return date.toISOString().split('T')[0];
    },

    /**
     * Registrar pago
     */
    recordPayment(paymentId, paidDate, amount) {
        const payment = {
            paidDate: paidDate || new Date().toISOString().split('T')[0],
            status: 'paid',
            amount: amount
        };

        Storage.updatePayment(paymentId, payment);
        return payment;
    },

    /**
     * Calcular estado de un pago
     */
    getPaymentStatus(payment) {
        if (payment.status === 'paid') {
            return {
                status: 'paid',
                label: 'Pagado',
                class: 'success',
                daysLate: 0
            };
        }

        const today = new Date();
        const dueDate = new Date(payment.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                status: 'upcoming',
                label: 'Próximo',
                class: 'info',
                daysLate: 0
            };
        } else if (diffDays <= 5) {
            return {
                status: 'pending',
                label: 'Pendiente',
                class: 'warning',
                daysLate: diffDays
            };
        } else {
            return {
                status: 'late',
                label: 'Atrasado',
                class: 'danger',
                daysLate: diffDays
            };
        }
    },

    /**
     * Obtener resumen de pagos de un contrato
     */
    getContractPaymentSummary(contractId) {
        const payments = Storage.getPaymentsByContract(contractId);

        const paid = payments.filter(p => p.status === 'paid');
        const pending = payments.filter(p => p.status === 'pending');
        const late = payments.filter(p => {
            const status = this.getPaymentStatus(p);
            return status.status === 'late';
        });

        const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
        const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);

        return {
            total: payments.length,
            paid: paid.length,
            pending: pending.length,
            late: late.length,
            totalPaid,
            totalPending,
            payments
        };
    },

    /**
     * Obtener pagos atrasados de todos los contratos
     */
    getAllLatePayments() {
        const allPayments = Storage.getPayments();
        const latePayments = [];

        allPayments.forEach(payment => {
            const status = this.getPaymentStatus(payment);
            if (status.status === 'late') {
                const contract = Storage.getContracts().find(c => c.id === payment.contractId);
                const property = contract ? Storage.getProperties().find(p => p.id === contract.propertyId) : null;

                latePayments.push({
                    ...payment,
                    contract,
                    property,
                    daysLate: status.daysLate
                });
            }
        });

        return latePayments.sort((a, b) => b.daysLate - a.daysLate);
    },

    /**
     * Obtener ingresos mensuales
     */
    getMonthlyIncome(year, month) {
        const allPayments = Storage.getPayments();
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        const monthPayments = allPayments.filter(p =>
            p.month === monthStr && p.status === 'paid'
        );

        return monthPayments.reduce((sum, p) => sum + p.amount, 0);
    },

    /**
     * Obtener ingresos anuales
     */
    getAnnualIncome(year) {
        const allPayments = Storage.getPayments();

        const yearPayments = allPayments.filter(p => {
            const paymentYear = parseInt(p.month.split('-')[0]);
            return paymentYear === year && p.status === 'paid';
        });

        return yearPayments.reduce((sum, p) => sum + p.amount, 0);
    },

    /**
     * Exportar historial de pagos a CSV
     */
    exportToCSV(payments) {
        const headers = ['Fecha', 'Propiedad', 'Arrendatario', 'Monto', 'Estado', 'Días de atraso'];
        const rows = payments.map(p => {
            const contract = Storage.getContracts().find(c => c.id === p.contractId);
            const property = contract ? Storage.getProperties().find(pr => pr.id === contract.propertyId) : null;
            const status = this.getPaymentStatus(p);

            return [
                p.month,
                property?.address || 'N/A',
                contract?.tenant?.name || 'N/A',
                p.amount,
                status.label,
                status.daysLate
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    },

    /**
     * Descargar CSV
     */
    downloadCSV(payments, filename = 'pagos.csv') {
        const csv = this.exportToCSV(payments);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Payments;
}
