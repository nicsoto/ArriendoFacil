/**
 * CALCULATOR.JS
 * Calculadora de reajustes usando IPC y UF
 * Integración con API Mindicador.cl
 */

const Calculator = {
    // Cache para datos de la API (24 horas)
    cache: {
        ipc: null,
        uf: null,
        lastUpdate: null
    },

    API_BASE: 'https://mindicador.cl/api',

    /**
     * Verificar si el cache es válido (menos de 24 horas)
     */
    isCacheValid() {
        if (!this.cache.lastUpdate) return false;
        const now = new Date().getTime();
        const lastUpdate = new Date(this.cache.lastUpdate).getTime();
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
        return hoursDiff < 24;
    },

    /**
     * Obtener datos de IPC desde la API
     */
    async fetchIPC() {
        try {
            if (this.isCacheValid() && this.cache.ipc) {
                return this.cache.ipc;
            }

            const response = await fetch(`${this.API_BASE}/ipc`);
            if (!response.ok) throw new Error('Error al obtener IPC');

            const data = await response.json();
            this.cache.ipc = data.serie;
            this.cache.lastUpdate = new Date().toISOString();

            return this.cache.ipc;
        } catch (error) {
            console.error('Error fetching IPC:', error);
            throw error;
        }
    },

    /**
     * Obtener datos de UF desde la API
     */
    async fetchUF() {
        try {
            if (this.isCacheValid() && this.cache.uf) {
                return this.cache.uf;
            }

            const response = await fetch(`${this.API_BASE}/uf`);
            if (!response.ok) throw new Error('Error al obtener UF');

            const data = await response.json();
            this.cache.uf = data.serie;
            this.cache.lastUpdate = new Date().toISOString();

            return this.cache.uf;
        } catch (error) {
            console.error('Error fetching UF:', error);
            throw error;
        }
    },

    /**
   * Obtener valor de IPC en una fecha específica
   */
    getIPCAtDate(ipcData, date) {
        const targetDate = new Date(date);
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth() + 1;

        // Buscar coincidencia exacta por año y mes
        let match = ipcData.find(item => {
            const itemDate = new Date(item.fecha);
            return itemDate.getFullYear() === targetYear &&
                (itemDate.getMonth() + 1) === targetMonth;
        });

        // Si no hay coincidencia exacta, buscar el mes más cercano anterior
        if (!match) {
            const sortedData = ipcData
                .map(item => ({
                    ...item,
                    date: new Date(item.fecha)
                }))
                .filter(item => item.date <= targetDate)
                .sort((a, b) => b.date - a.date);

            if (sortedData.length > 0) {
                match = sortedData[0];
                console.log(`No hay IPC exacto para ${targetYear}-${targetMonth}, usando IPC de ${match.date.toISOString().slice(0, 7)}`);
            }
        }

        return match ? match.valor : null;
    },

    /**
     * Obtener valor de UF en una fecha específica
     */
    getUFAtDate(ufData, date) {
        const targetDate = new Date(date).toISOString().split('T')[0];

        const match = ufData.find(item => {
            const itemDate = new Date(item.fecha).toISOString().split('T')[0];
            return itemDate === targetDate;
        });

        return match ? match.valor : null;
    },

    /**
   * Calcular reajuste por IPC
   * @param {number} initialAmount - Monto inicial del arriendo
   * @param {string} startDate - Fecha de inicio del contrato
   * @param {string} endDate - Fecha de término/reajuste
   */
    async calculateIPCAdjustment(initialAmount, startDate, endDate) {
        try {
            const ipcData = await this.fetchIPC();

            // IMPORTANTE: El IPC se publica mensualmente, el día no importa
            // Solo usamos año y mes para la comparación
            const startYear = new Date(startDate).getFullYear();
            const startMonth = new Date(startDate).getMonth();
            const endYear = new Date(endDate).getFullYear();
            const endMonth = new Date(endDate).getMonth();

            // IMPORTANTE: Mindicador.cl devuelve VARIACIONES MENSUALES (porcentajes)
            // No el índice base. Para calcular el reajuste correcto como el INE,
            // necesitamos ACUMULAR todas las variaciones mensuales entre las dos fechas

            // Filtrar datos entre startMonth/Year y endMonth/Year (inclusive)
            const relevantData = ipcData.filter(item => {
                const itemDate = new Date(item.fecha);
                const itemYear = itemDate.getFullYear();
                const itemMonth = itemDate.getMonth();

                // Comparar solo año y mes
                const itemYearMonth = itemYear * 12 + itemMonth;
                const startYearMonth = startYear * 12 + startMonth;
                const endYearMonth = endYear * 12 + endMonth;

                return itemYearMonth >= startYearMonth && itemYearMonth <= endYearMonth;
            }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            if (relevantData.length === 0) {
                const dates = ipcData.map(d => new Date(d.fecha));
                const minDate = new Date(Math.min(...dates)).toISOString().slice(0, 7);
                const maxDate = new Date(Math.max(...dates)).toISOString().slice(0, 7);
                throw new Error(`No se encontraron datos de IPC para las fechas especificadas. Datos disponibles desde ${minDate} hasta ${maxDate}.`);
            }

            // Calcular factor acumulado: (1 + var1/100) * (1 + var2/100) * ... - 1
            let accumulatedFactor = 1;
            relevantData.forEach(item => {
                accumulatedFactor *= (1 + item.valor / 100);
            });

            // La variación acumulada total es el factor menos 1, en porcentaje
            const totalVariation = (accumulatedFactor - 1) * 100;

            // Nuevo monto = monto inicial * factor acumulado
            const newAmount = initialAmount * accumulatedFactor;

            // Formatear fechas para mostrar solo mes/año
            const formatMonthYear = (dateStr) => {
                const d = new Date(dateStr);
                return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
            };

            return {
                originalAmount: initialAmount,
                newAmount: Math.round(newAmount),
                variation: totalVariation.toFixed(2),
                ipcStart: relevantData[0].valor.toFixed(2) + '%',
                ipcEnd: relevantData[relevantData.length - 1].valor.toFixed(2) + '%',
                monthsCount: relevantData.length,
                startDate: formatMonthYear(relevantData[0].fecha),
                endDate: formatMonthYear(relevantData[relevantData.length - 1].fecha)
            };
        } catch (error) {
            console.error('Error calculando reajuste IPC:', error);
            throw error;
        }
    },

    /**
     * Calcular reajuste por UF
     * @param {number} ufAmount - Monto en UF
     * @param {string} date - Fecha para conversión
     */
    async calculateUFAdjustment(ufAmount, date) {
        try {
            const ufData = await this.fetchUF();
            const ufValue = this.getUFAtDate(ufData, date);

            if (!ufValue) {
                throw new Error('No se encontró valor de UF para la fecha especificada');
            }

            const clpAmount = ufAmount * ufValue;

            return {
                ufAmount,
                ufValue: ufValue.toFixed(2),
                clpAmount: Math.round(clpAmount),
                date
            };
        } catch (error) {
            console.error('Error calculando reajuste UF:', error);
            throw error;
        }
    },

    /**
     * Obtener UF actual (más reciente)
     */
    async getCurrentUF() {
        try {
            const ufData = await this.fetchUF();
            return ufData[0]; // El primer elemento es el más reciente
        } catch (error) {
            console.error('Error obteniendo UF actual:', error);
            throw error;
        }
    },

    /**
     * Convertir CLP a UF
     */
    async convertCLPtoUF(clpAmount, date = new Date()) {
        try {
            const ufData = await this.fetchUF();
            const ufValue = this.getUFAtDate(ufData, date);

            if (!ufValue) {
                throw new Error('No se encontró valor de UF');
            }

            const ufAmount = clpAmount / ufValue;

            return {
                clpAmount,
                ufAmount: ufAmount.toFixed(2),
                ufValue: ufValue.toFixed(2),
                date: date.toISOString().split('T')[0]
            };
        } catch (error) {
            console.error('Error convirtiendo CLP a UF:', error);
            throw error;
        }
    },

    /**
     * Calcular próximo reajuste según el tipo
     */
    async calculateNextAdjustment(contract) {
        const { adjustmentType, monthlyRent, startDate } = contract;

        // Calcular fecha de aniversario (1 año después)
        const start = new Date(startDate);
        const nextAdjustment = new Date(start);
        nextAdjustment.setFullYear(nextAdjustment.getFullYear() + 1);

        if (adjustmentType === 'IPC') {
            return await this.calculateIPCAdjustment(
                monthlyRent,
                startDate,
                nextAdjustment.toISOString().split('T')[0]
            );
        } else if (adjustmentType === 'UF') {
            // Para contratos en UF, convertir a CLP
            return await this.calculateUFAdjustment(
                monthlyRent,
                nextAdjustment.toISOString().split('T')[0]
            );
        } else {
            // Sin reajuste (fijo)
            return {
                originalAmount: monthlyRent,
                newAmount: monthlyRent,
                variation: 0,
                type: 'fixed'
            };
        }
    },

    /**
     * Formatear montos en CLP
     */
    formatCLP(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Formatear porcentajes
     */
    formatPercent(value) {
        return `${value > 0 ? '+' : ''}${value}%`;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}
