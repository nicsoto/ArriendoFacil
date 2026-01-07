/**
 * TAXES.JS
 * Calculadora de impuestos para el SII
 */

const Taxes = {
    /**
     * Calcular resumen tributario anual
     */
    calculateAnnualTaxSummary(year) {
        const properties = Storage.getProperties();
        const contracts = Storage.getContracts();
        const payments = Storage.getPayments();

        // Filtrar pagos del año
        const yearPayments = payments.filter(p => {
            const paymentYear = parseInt(p.month.split('-')[0]);
            return paymentYear === year && p.status === 'paid';
        });

        // Agrupar ingresos por propiedad
        const incomeByProperty = properties.map(property => {
            const propertyContracts = contracts.filter(c => c.propertyId === property.id);
            const contractIds = propertyContracts.map(c => c.id);
            const propertyPayments = yearPayments.filter(p => contractIds.includes(p.contractId));

            const totalIncome = propertyPayments.reduce((sum, p) => sum + p.amount, 0);

            return {
                property,
                totalIncome,
                isDFL2: property.isDFL2,
                paymentCount: propertyPayments.length
            };
        });

        // Determinar propiedades exentas (primeras 2 DFL-2)
        const dfl2Properties = incomeByProperty.filter(p => p.isDFL2);
        dfl2Properties.forEach((p, index) => {
            p.isExempt = index < 2; // Solo las primeras 2 están exentas
        });

        // Calcular totales
        const totalIncome = incomeByProperty.reduce((sum, p) => sum + p.totalIncome, 0);
        const exemptIncome = incomeByProperty
            .filter(p => p.isExempt)
            .reduce((sum, p) => sum + p.totalIncome, 0);
        const taxableIncome = totalIncome - exemptIncome;

        return {
            year,
            totalIncome,
            exemptIncome,
            taxableIncome,
            properties: incomeByProperty,
            dfl2Count: dfl2Properties.length,
            exemptProperties: dfl2Properties.filter(p => p.isExempt).length
        };
    },

    /**
     * Calcular gastos deducibles
     */
    calculateDeductibleExpenses(year) {
        // En una versión futura, esto podría incluir:
        // - Contribuciones de bienes raíces
        // - Reparaciones mayores
        // - Gastos de administración

        // Por ahora, retornamos estructura base
        return {
            year,
            contribuciones: 0,
            reparaciones: 0,
            administracion: 0,
            otros: 0,
            total: 0
        };
    },

    /**
     * Generar informe para el contador
     */
    generateAccountantReport(year) {
        const summary = this.calculateAnnualTaxSummary(year);
        const expenses = this.calculateDeductibleExpenses(year);

        const netIncome = summary.taxableIncome - expenses.total;

        return {
            ...summary,
            expenses,
            netIncome,
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Exportar resumen tributario a CSV
     */
    exportTaxSummaryCSV(year) {
        const summary = this.calculateAnnualTaxSummary(year);

        const headers = ['Propiedad', 'Dirección', 'DFL-2', 'Exenta', 'Ingresos Anuales'];
        const rows = summary.properties.map(p => [
            p.property.type,
            p.property.address,
            p.isDFL2 ? 'Sí' : 'No',
            p.isExempt ? 'Sí' : 'No',
            p.totalIncome
        ]);

        // Agregar totales
        rows.push([]);
        rows.push(['', '', '', 'Total Ingresos:', summary.totalIncome]);
        rows.push(['', '', '', 'Ingresos Exentos:', summary.exemptIncome]);
        rows.push(['', '', '', 'Ingresos Tributables:', summary.taxableIncome]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    },

    /**
     * Descargar resumen tributario
     */
    downloadTaxSummary(year) {
        const csv = this.exportTaxSummaryCSV(year);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `resumen-tributario-${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Generar desglose mensual
     */
    getMonthlyBreakdown(year) {
        const payments = Storage.getPayments();
        const breakdown = [];

        for (let month = 1; month <= 12; month++) {
            const monthStr = `${year}-${String(month).padStart(2, '0')}`;
            const monthPayments = payments.filter(p =>
                p.month === monthStr && p.status === 'paid'
            );

            const income = monthPayments.reduce((sum, p) => sum + p.amount, 0);

            breakdown.push({
                month: monthStr,
                monthName: new Date(year, month - 1).toLocaleDateString('es-CL', { month: 'long' }),
                income,
                paymentCount: monthPayments.length
            });
        }

        return breakdown;
    },

    /**
     * Información sobre DFL-2
     */
    getDFL2Info() {
        return {
            title: 'Beneficio DFL-2',
            description: 'Las viviendas acogidas al DFL-2 (hasta 140 m²) tienen beneficios tributarios.',
            rules: [
                'Las primeras 2 propiedades DFL-2 están EXENTAS de impuestos sobre arriendo.',
                'A partir de la 3ª propiedad DFL-2, los ingresos por arriendo TRIBUTAN.',
                'Este beneficio aplica solo para personas naturales.',
                'Las empresas NO tienen acceso al beneficio DFL-2.'
            ],
            reference: 'Ley N° 21.420',
            link: 'https://www.sii.cl'
        };
    },

    /**
     * Información sobre Formulario 22
     */
    getForm22Info() {
        return {
            title: 'Declaración de Renta (Formulario 22)',
            description: 'Los ingresos por arriendo deben declararse anualmente en el Formulario 22.',
            instructions: [
                'Declarar ingresos brutos por arriendo (de la 3ª propiedad DFL-2 en adelante).',
                'Personas naturales están exentas del Impuesto de Primera Categoría.',
                'Se aplica Impuesto Global Complementario según tramo de renta.',
                'Puedes deducir gastos como contribuciones y reparaciones (si llevas contabilidad completa).',
                'La declaración se realiza en abril de cada año.',
                'Usa el Asistente de Arriendo de Bienes Raíces del SII.'
            ],
            deadline: 'Abril',
            link: 'https://www.sii.cl'
        };
    },

    /**
     * Formatear montos
     */
    formatCLP(amount) {
        return Calculator.formatCLP(amount);
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Taxes;
}
