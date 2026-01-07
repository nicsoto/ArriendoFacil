/**
 * VIEWS.JS
 * Generación de vistas HTML
 */

const Views = {
  /**
   * Renderizar Dashboard
   */
  renderDashboard() {
    const alerts = Alerts.getAllAlerts();
    const properties = Storage.getProperties();
    const activeContracts = Storage.getActiveContracts();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthlyIncome = Payments.getMonthlyIncome(currentYear, currentMonth);
    const latePayments = Payments.getAllLatePayments();

    return `
      <h1>Dashboard</h1>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-4 mb-lg">
        <div class="stat-card">
          <div class="stat-label">Propiedades</div>
          <div class="stat-value">${properties.length}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Contratos Activos</div>
          <div class="stat-value">${activeContracts.length}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Ingresos del Mes</div>
          <div class="stat-value">${Calculator.formatCLP(monthlyIncome)}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Pagos Atrasados</div>
          <div class="stat-value ${latePayments.length > 0 ? 'stat-change negative' : ''}">${latePayments.length}</div>
        </div>
      </div>
      
      <!-- Alertas -->
      ${alerts.length > 0 ? `
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">🔔 Alertas (${alerts.length})</h3>
          </div>
          <div class="card-body">
            ${alerts.slice(0, 5).map(alert => `
              <div class="alert alert-${alert.severity}">
                <div class="alert-title">${alert.title}</div>
                <div>${alert.message}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="alert alert-success mb-lg">
          ✅ No hay alertas pendientes. Todo está al día.
        </div>
      `}
      
      <!-- Propiedades -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🏠 Mis Propiedades</h3>
          <a href="#properties" class="btn btn-primary btn-sm">Ver todas</a>
        </div>
        <div class="card-body">
          ${properties.length > 0 ? `
            <div class="grid grid-cols-3">
              ${properties.slice(0, 3).map(prop => `
                <div class="card">
                  <h4>${prop.type === 'departamento' ? '🏢' : '🏡'} ${prop.type.charAt(0).toUpperCase() + prop.type.slice(1)}</h4>
                  <p class="text-sm">${prop.address}</p>
                  <p class="text-xs text-tertiary">${prop.size} m²</p>
                  ${prop.isDFL2 ? '<span class="badge badge-success">DFL-2</span>' : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-title">No tienes propiedades registradas</div>
              <p class="empty-state-text">Comienza agregando tu primera propiedad</p>
              <a href="#properties" class="btn btn-primary">Agregar Propiedad</a>
            </div>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Renderizar Propiedades
   */
  renderProperties() {
    const properties = Storage.getProperties();

    return `
      <div class="flex justify-between items-center mb-lg">
        <h1>Propiedades</h1>
        <button id="add-property-btn" class="btn btn-primary">
          <span>+</span> Agregar Propiedad
        </button>
      </div>
      
      ${properties.length > 0 ? `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Dirección</th>
                <th>Tamaño</th>
                <th>DFL-2</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${properties.map(prop => `
                <tr>
                  <td>${prop.type.charAt(0).toUpperCase() + prop.type.slice(1)}</td>
                  <td>${prop.address}</td>
                  <td>${prop.size} m²</td>
                  <td>${prop.isDFL2 ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-neutral">No</span>'}</td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="Modals.showEditPropertyModal('${prop.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="Modals.showDeletePropertyConfirm('${prop.id}')">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-title">No hay propiedades registradas</div>
          <button id="add-property-btn" class="btn btn-primary">Agregar Primera Propiedad</button>
        </div>
      `}
    `;
  },

  /**
   * Renderizar Contratos
   */
  renderContracts() {
    const contracts = Storage.getContracts();
    const properties = Storage.getProperties();

    return `
      <div class="flex justify-between items-center mb-lg">
        <h1>Contratos</h1>
        <button id="add-contract-btn" class="btn btn-primary">
          <span>+</span> Nuevo Contrato
        </button>
      </div>
      
      ${contracts.length > 0 ? `
        <div class="grid grid-cols-2">
          ${contracts.map(contract => {
      const property = properties.find(p => p.id === contract.propertyId);
      const daysUntilExpiry = Alerts.getDaysUntilExpiry(contract.endDate);

      return `
              <div class="card">
                <div class="card-header">
                  <h4>${property?.address || 'Propiedad desconocida'}</h4>
                  <span class="badge badge-${contract.status === 'active' ? 'success' : 'neutral'}">
                    ${contract.status === 'active' ? 'Activo' : 'Terminado'}
                  </span>
                </div>
                <div class="card-body">
                  <p><strong>Arrendatario:</strong> ${contract.tenant.name}</p>
                  <p><strong>Renta:</strong> ${Calculator.formatCLP(contract.monthlyRent)}</p>
                  <p><strong>Inicio:</strong> ${contract.startDate}</p>
                  <p><strong>Término:</strong> ${contract.endDate} 
                    ${daysUntilExpiry > 0 && daysUntilExpiry <= 30 ?
          `<span class="badge badge-warning">${daysUntilExpiry} días</span>` : ''}
                  </p>
                  <p><strong>Reajuste:</strong> ${contract.adjustmentType}</p>
                </div>
                <div class="card-footer">
                  <button class="btn btn-sm btn-secondary generate-contract-btn" data-contract-id="${contract.id}">
                    Ver Contrato
                  </button>
                  <a href="#payments" class="btn btn-sm btn-ghost">Pagos</a>
                  <button class="btn btn-sm btn-danger" onclick="Modals.showDeleteContractConfirm('${contract.id}')">
                    Eliminar
                  </button>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-title">No hay contratos registrados</div>
          <button id="add-contract-btn" class="btn btn-primary">Crear Primer Contrato</button>
        </div>
      `}
    `;
  },

  /**
   * Renderizar Pagos
   */
  renderPayments() {
    const payments = Storage.getPayments();

    return `
      <div class="flex justify-between items-center mb-lg">
        <h1>Pagos</h1>
        <button id="export-payments-btn" class="btn btn-secondary">
          Exportar CSV
        </button>
      </div>
      
      ${payments.length > 0 ? `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${payments.slice(0, 20).map(payment => {
      const status = Payments.getPaymentStatus(payment);
      return `
                  <tr>
                    <td>${payment.month}</td>
                    <td>${Calculator.formatCLP(payment.amount)}</td>
                    <td>${payment.dueDate}</td>
                    <td><span class="badge badge-${status.class}">${status.label}</span></td>
                    <td>
                      ${payment.status !== 'paid' ? `<button class="btn btn-sm btn-success" onclick="Modals.showPaymentModal('${payment.id}')">Registrar Pago</button>` : ''}
                    </td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-title">No hay pagos registrados</div>
          <p class="empty-state-text">Los pagos se generarán automáticamente al crear contratos</p>
        </div>
      `}
    `;
  },

  /**
   * Renderizar Calculadora
   */
  renderCalculator() {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const lastYearMonth = `${currentDate.getFullYear() - 1}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    return `
      <h1>Calculadora de Reajustes</h1>
      
      <div class="grid grid-cols-2">
        <div class="card">
          <h3>Reajuste por IPC</h3>
          <form id="ipc-calculator-form">
            <div class="form-group">
              <label class="form-label form-label-required">Monto Inicial (CLP)</label>
              <input type="number" id="ipc-amount" class="form-input" required placeholder="450000">
            </div>
            
            <div class="form-group">
              <label class="form-label form-label-required">Mes/Año Inicio</label>
              <input type="month" id="ipc-start-date" class="form-input" required value="${lastYearMonth}">
              <span class="form-help">El IPC se calcula por mes, el día no importa</span>
            </div>
            
            <div class="form-group">
              <label class="form-label form-label-required">Mes/Año Final</label>
              <input type="month" id="ipc-end-date" class="form-input" required value="${currentMonth}">
            </div>
            
            <button type="submit" class="btn btn-primary">Calcular Reajuste</button>
          </form>
          
          <div id="ipc-result" class="mt-lg"></div>
        </div>
        
        <div class="card">
          <h3>Información sobre IPC</h3>
          <p>El Índice de Precios al Consumidor (IPC) mide la variación de precios de bienes y servicios en Chile.</p>
          
          <div class="alert alert-info">
            <strong>¿Cómo funciona?</strong><br>
            El IPC se publica mensualmente. El reajuste acumula todas las variaciones mensuales entre las dos fechas seleccionadas.
          </div>
          
          <p class="text-sm text-secondary">
            Los datos de IPC se obtienen en tiempo real desde Mindicador.cl, que toma la información oficial del Banco Central de Chile.
          </p>
          
          <p class="text-sm text-secondary mt-lg">
            <strong>Nota:</strong> El día específico no afecta el cálculo, solo se usan el mes y año.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Renderizar Documentos
   */
  renderDocuments() {
    const contracts = Storage.getContracts();

    return `
      <h1>Generación de Documentos</h1>
      
      <div class="alert alert-warning mb-lg">
        <strong>⚠️ Aviso Legal:</strong> Los documentos generados son plantillas informativas. Se recomienda revisión por un abogado antes de uso oficial.
      </div>
      
      ${contracts.length > 0 ? `
        <div class="grid">
          ${contracts.map(contract => `
            <div class="card">
              <h4>Contrato: ${contract.tenant.name}</h4>
              <div class="flex gap-sm mt-lg">
                <button class="btn btn-primary btn-sm generate-contract-btn" data-contract-id="${contract.id}">
                  📄 Contrato Completo
                </button>
                <button class="btn btn-secondary btn-sm" data-contract-id="${contract.id}" data-doc-type="annex">
                  📝 Anexo de Reajuste
                </button>
                <button class="btn btn-danger btn-sm" data-contract-id="${contract.id}" data-doc-type="termination">
                  ✉️ Carta de Término
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-title">No hay contratos disponibles</div>
          <p class="empty-state-text">Primero debes crear un contrato para generar documentos</p>
          <a href="#contracts" class="btn btn-primary">Ir a Contratos</a>
        </div>
      `}
    `;
  },

  /**
   * Renderizar Impuestos
   */
  renderTaxes() {
    const currentYear = new Date().getFullYear();
    const summary = Taxes.calculateAnnualTaxSummary(currentYear);
    const dfl2Info = Taxes.getDFL2Info();
    const form22Info = Taxes.getForm22Info();

    return `
      <h1>Calculadora de Impuestos SII</h1>
      
      <div class="grid grid-cols-3 mb-lg">
        <div class="stat-card">
          <div class="stat-label">Ingresos Totales ${currentYear}</div>
          <div class="stat-value">${Taxes.formatCLP(summary.totalIncome)}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Ingresos Exentos</div>
          <div class="stat-value stat-change positive">${Taxes.formatCLP(summary.exemptIncome)}</div>
          <p class="text-xs">${summary.exemptProperties} propiedades DFL-2</p>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">A Declarar al SII</div>
          <div class="stat-value">${Taxes.formatCLP(summary.taxableIncome)}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-2">
        <div class="card">
          <h3>${dfl2Info.title}</h3>
          <p>${dfl2Info.description}</p>
          <ul>
            ${dfl2Info.rules.map(rule => `<li>${rule}</li>`).join('')}
          </ul>
        </div>
        
        <div class="card">
          <h3>${form22Info.title}</h3>
          <p>${form22Info.description}</p>
          <ol>
            ${form22Info.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
          </ol>
          <button id="export-tax-summary-btn" class="btn btn-primary mt-lg">
            Exportar Resumen para Contador
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Renderizar Configuración
   */
  renderSettings() {
    const settings = Storage.getSettings();
    const landlord = settings.landlord || {};

    return `
      <h1>Configuración</h1>
      
      <div class="card mb-lg">
        <h3>Información del Arrendador</h3>
        <form id="settings-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <input type="text" id="landlord-name" class="form-input" value="${landlord.name || ''}" placeholder="Juan Pérez">
            </div>
            
            <div class="form-group">
              <label class="form-label">RUT</label>
              <input type="text" id="landlord-rut" class="form-input" value="${landlord.rut || ''}" placeholder="12.345.678-9">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="landlord-email" class="form-input" value="${landlord.email || ''}" placeholder="correo@ejemplo.com">
            </div>
            
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="tel" id="landlord-phone" class="form-input" value="${landlord.phone || ''}" placeholder="+56 9 1234 5678">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input type="text" id="landlord-address" class="form-input" value="${landlord.address || ''}" placeholder="Calle Ejemplo 123">
            </div>
            
            <div class="form-group">
              <label class="form-label">Ciudad</label>
              <input type="text" id="landlord-city" class="form-input" value="${landlord.city || 'Santiago'}" placeholder="Santiago">
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </form>
      </div>
      
      <div class="card">
        <h3>Gestión de Datos</h3>
        <div class="flex gap-md">
          <button id="export-data-btn" class="btn btn-secondary">
            Exportar Datos (Respaldo)
          </button>
          <button id="import-data-btn" class="btn btn-secondary">
            Importar Datos
          </button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;">
        </div>
        
        <div class="alert alert-info mt-lg">
          <strong>ℹ️ Importante:</strong> Tus datos se guardan localmente en tu navegador. Exporta regularmente un respaldo para evitar pérdida de información.
        </div>
      </div>
    `;
  },

  /**
   * Renderizar 404
   */
  render404() {
    return `
      <div class="empty-state">
        <div class="empty-state-title">404 - Página no encontrada</div>
        <p class="empty-state-text">La página que buscas no existe</p>
        <a href="#dashboard" class="btn btn-primary">Volver al Dashboard</a>
      </div>
    `;
  }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Views;
}
