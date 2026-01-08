/**
 * MODALS.JS
 * Gestión de modales y formularios
 */

const Modals = {
  /**
   * Mostrar modal para agregar propiedad
   */
  showAddPropertyModal() {
    const modalHTML = `
      <div class="modal-overlay" id="property-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Agregar Propiedad</h3>
            <button class="modal-close" onclick="Modals.closeModal('property-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="add-property-form">
              <div class="form-group">
                <label class="form-label form-label-required">Tipo de Propiedad</label>
                <select id="property-type" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="local">Local Comercial</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label form-label-required">Dirección Completa</label>
                <input type="text" id="property-address" class="form-input" required 
                       placeholder="Ej: Av. Providencia 1234, Depto 501">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Tamaño (m²)</label>
                  <input type="number" id="property-size" class="form-input" required 
                         placeholder="Ej: 65" min="1">
                </div>
                
                <div class="form-group">
                  <label class="form-label">¿Es DFL-2?</label>
                  <select id="property-dfl2" class="form-select">
                    <option value="false">No</option>
                    <option value="true">Sí (hasta 140 m²)</option>
                  </select>
                  <span class="form-help">Importante para cálculo de impuestos</span>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('property-modal')">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Guardar Propiedad
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listener para el formulario
    document.getElementById('add-property-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProperty();
    });
  },

  /**
   * Guardar propiedad
   */
  saveProperty() {
    const property = {
      type: document.getElementById('property-type').value,
      address: document.getElementById('property-address').value,
      size: parseInt(document.getElementById('property-size').value),
      isDFL2: document.getElementById('property-dfl2').value === 'true'
    };

    Storage.addProperty(property);
    this.closeModal('property-modal');
    App.navigate('properties'); // Recargar vista

    // Mostrar mensaje de éxito
    this.showToast('✅ Propiedad agregada correctamente', 'success');
  },

  /**
   * Mostrar modal para agregar contrato
   */
  showAddContractModal() {
    const properties = Storage.getProperties();

    if (properties.length === 0) {
      alert('Primero debes agregar una propiedad antes de crear un contrato.');
      App.navigate('properties');
      return;
    }

    const modalHTML = `
      <div class="modal-overlay" id="contract-modal">
        <div class="modal" style="max-width: 800px;">
          <div class="modal-header">
            <h3 class="modal-title">Nuevo Contrato de Arriendo</h3>
            <button class="modal-close" onclick="Modals.closeModal('contract-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="add-contract-form">
              <!-- Propiedad -->
              <h4>Propiedad</h4>
              <div class="form-group">
                <label class="form-label form-label-required">Seleccionar Propiedad</label>
                <select id="contract-property" class="form-select" required>
                  <option value="">Seleccionar...</option>
                  ${properties.map(p => `
                    <option value="${p.id}">${p.address} (${p.type})</option>
                  `).join('')}
                </select>
              </div>
              
              <!-- Arrendatario -->
              <h4 style="margin-top: var(--space-lg);">Datos del Arrendatario</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Nombre Completo</label>
                  <input type="text" id="tenant-name" class="form-input" required 
                         placeholder="María González">
                </div>
                
                <div class="form-group">
                  <label class="form-label form-label-required">RUT</label>
                  <input type="text" id="tenant-rut" class="form-input" required 
                         placeholder="12.345.678-9">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" id="tenant-email" class="form-input" 
                         placeholder="correo@ejemplo.com">
                </div>
                
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="tel" id="tenant-phone" class="form-input" 
                         placeholder="+56 9 1234 5678">
                </div>
              </div>
              
              <!-- Aval (opcional) -->
              <h4 style="margin-top: var(--space-lg);">
                Aval Solidario <span style="font-weight: normal; font-size: 0.875rem;">(Opcional)</span>
              </h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nombre Completo</label>
                  <input type="text" id="guarantor-name" class="form-input" 
                         placeholder="Pedro González">
                </div>
                
                <div class="form-group">
                  <label class="form-label">RUT</label>
                  <input type="text" id="guarantor-rut" class="form-input" 
                         placeholder="98.765.432-1">
                </div>
              </div>
              
              <!-- Detalles del Contrato -->
              <h4 style="margin-top: var(--space-lg);">Detalles del Contrato</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Fecha Inicio</label>
                  <input type="date" id="contract-start" class="form-input" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label form-label-required">Fecha Término</label>
                  <input type="date" id="contract-end" class="form-input" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Renta Mensual (CLP)</label>
                  <input type="number" id="contract-rent" class="form-input" required 
                         placeholder="450000" min="0">
                </div>
                
                <div class="form-group">
                  <label class="form-label form-label-required">Tipo de Reajuste</label>
                  <select id="contract-adjustment" class="form-select" required>
                    <option value="IPC">IPC (Índice de Precios al Consumidor)</option>
                    <option value="UF">UF (Unidad de Fomento)</option>
                    <option value="fixed">Sin reajuste (Fijo)</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label form-label-required">Garantía (CLP)</label>
                <input type="number" id="contract-deposit" class="form-input" required 
                       placeholder="450000" min="0">
                <span class="form-help">Máximo 2 meses de arriendo según Ley 21.461</span>
              </div>
              
              <!-- Opciones de Contrato -->
              <h4 style="margin-top: var(--space-lg);">Opciones del Contrato</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Tipo de Contrato</label>
                  <select id="contract-type" class="form-select" required>
                    <option value="plazo_fijo">Plazo Fijo</option>
                    <option value="mes_a_mes">Mes a Mes</option>
                    <option value="indefinido">Indefinido</option>
                  </select>
                  <span class="form-help">Afecta las reglas de desahucio</span>
                </div>
                
                <div class="form-group">
                  <label class="form-label form-label-required">Condición del Inmueble</label>
                  <select id="contract-furnished" class="form-select" required onchange="Modals.toggleFurnishedWarning(this.value)">
                    <option value="sin_amoblar">Sin amoblar</option>
                    <option value="amoblado">Amoblado</option>
                  </select>
                  <span class="form-help">Si es amoblado, está gravado con IVA</span>
                </div>
              </div>
              
              <div id="furnished-warning" class="alert alert-warning" style="display: none;">
                ⚠️ <strong>Importante:</strong> El arriendo de inmuebles amoblados está gravado con IVA (19%). 
                Deberás emitir boleta de servicios y declarar en el formulario F29.
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Subarriendo</label>
                  <select id="contract-sublease" class="form-select" required>
                    <option value="prohibido">Prohibido</option>
                    <option value="permitido">Permitido con autorización escrita</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Mascotas</label>
                  <select id="contract-pets" class="form-select">
                    <option value="prohibidas">Prohibidas</option>
                    <option value="permitidas">Permitidas</option>
                    <option value="con_restriccion">Con restricciones (especificar)</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <input type="checkbox" id="contract-inventory" style="margin-right: 8px;">
                  Incluir inventario / acta de entrega
                </label>
                <span class="form-help">Genera un anexo con el inventario para evitar conflictos al término</span>
              </div>
              
              <div id="inventory-section" class="form-group" style="display: none;">
                <label class="form-label">Inventario del Inmueble</label>
                <textarea id="contract-inventory-items" class="form-input" rows="5" 
                          placeholder="Ej:&#10;- Refrigerador Samsung (buen estado)&#10;- Cocina 4 platos (buen estado)&#10;- Sofá 3 cuerpos (uso normal)&#10;- Mesa comedor + 4 sillas"></textarea>
                <span class="form-help">Describe los bienes incluidos y su estado actual</span>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('contract-modal')">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Crear Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Establecer fecha de inicio por defecto (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('contract-start').value = today;

    // Establecer fecha de término por defecto (1 año después)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById('contract-end').value = nextYear.toISOString().split('T')[0];

    // Event listener para el formulario
    document.getElementById('add-contract-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveContract();
    });

    // Event listener para mostrar/ocultar sección de inventario
    document.getElementById('contract-inventory').addEventListener('change', (e) => {
      const inventorySection = document.getElementById('inventory-section');
      inventorySection.style.display = e.target.checked ? 'block' : 'none';
    });
  },

  /**
   * Mostrar/ocultar alerta de IVA para inmuebles amoblados
   */
  toggleFurnishedWarning(value) {
    const warning = document.getElementById('furnished-warning');
    if (warning) {
      warning.style.display = value === 'amoblado' ? 'block' : 'none';
    }
  },

  /**
   * Guardar contrato
   */
  saveContract() {
    const tenantAddress = Storage.getProperties().find(
      p => p.id === document.getElementById('contract-property').value
    )?.address || '';

    const contract = {
      propertyId: document.getElementById('contract-property').value,
      tenant: {
        name: document.getElementById('tenant-name').value,
        rut: document.getElementById('tenant-rut').value,
        email: document.getElementById('tenant-email').value,
        phone: document.getElementById('tenant-phone').value,
        address: tenantAddress
      },
      guarantor: null,
      startDate: document.getElementById('contract-start').value,
      endDate: document.getElementById('contract-end').value,
      monthlyRent: parseInt(document.getElementById('contract-rent').value),
      currency: 'CLP',
      adjustmentType: document.getElementById('contract-adjustment').value,
      deposit: parseInt(document.getElementById('contract-deposit').value),
      status: 'active',
      // Nuevas opciones de contrato
      contractType: document.getElementById('contract-type').value,
      furnished: document.getElementById('contract-furnished').value,
      sublease: document.getElementById('contract-sublease').value,
      pets: document.getElementById('contract-pets').value,
      hasInventory: document.getElementById('contract-inventory').checked,
      inventoryItems: document.getElementById('contract-inventory').checked
        ? document.getElementById('contract-inventory-items').value
        : ''
    };

    // Agregar aval si se completó
    const guarantorName = document.getElementById('guarantor-name').value;
    const guarantorRut = document.getElementById('guarantor-rut').value;

    if (guarantorName && guarantorRut) {
      contract.guarantor = {
        name: guarantorName,
        rut: guarantorRut,
        email: '',
        phone: '',
        address: ''
      };
    }

    const newContract = Storage.addContract(contract);

    // Generar pagos automáticamente
    const payments = Payments.generateMonthlyPayments(newContract);
    payments.forEach(payment => {
      Storage.addPayment(payment);
    });

    this.closeModal('contract-modal');
    App.navigate('contracts'); // Recargar vista

    // Mostrar mensaje de éxito
    this.showToast('✅ Contrato creado correctamente', 'success');
  },

  /**
   * Mostrar modal para editar propiedad
   */
  showEditPropertyModal(propertyId) {
    const property = Storage.getProperties().find(p => p.id === propertyId);
    if (!property) return;

    const modalHTML = `
      <div class="modal-overlay" id="edit-property-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Editar Propiedad</h3>
            <button class="modal-close" onclick="Modals.closeModal('edit-property-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="edit-property-form">
              <input type="hidden" id="edit-property-id" value="${property.id}">
              
              <div class="form-group">
                <label class="form-label form-label-required">Tipo de Propiedad</label>
                <select id="edit-property-type" class="form-select" required>
                  <option value="departamento" ${property.type === 'departamento' ? 'selected' : ''}>Departamento</option>
                  <option value="casa" ${property.type === 'casa' ? 'selected' : ''}>Casa</option>
                  <option value="oficina" ${property.type === 'oficina' ? 'selected' : ''}>Oficina</option>
                  <option value="local" ${property.type === 'local' ? 'selected' : ''}>Local Comercial</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label form-label-required">Dirección Completa</label>
                <input type="text" id="edit-property-address" class="form-input" required 
                       value="${property.address}">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label form-label-required">Tamaño (m²)</label>
                  <input type="number" id="edit-property-size" class="form-input" required 
                         value="${property.size}" min="1">
                </div>
                
                <div class="form-group">
                  <label class="form-label">¿Es DFL-2?</label>
                  <select id="edit-property-dfl2" class="form-select">
                    <option value="false" ${!property.isDFL2 ? 'selected' : ''}>No</option>
                    <option value="true" ${property.isDFL2 ? 'selected' : ''}>Sí (hasta 140 m²)</option>
                  </select>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('edit-property-modal')">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('edit-property-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateProperty();
    });
  },

  /**
   * Actualizar propiedad
   */
  updateProperty() {
    const id = document.getElementById('edit-property-id').value;
    const updates = {
      type: document.getElementById('edit-property-type').value,
      address: document.getElementById('edit-property-address').value,
      size: parseInt(document.getElementById('edit-property-size').value),
      isDFL2: document.getElementById('edit-property-dfl2').value === 'true'
    };

    Storage.updateProperty(id, updates);
    this.closeModal('edit-property-modal');
    App.navigate('properties');
    this.showToast('✅ Propiedad actualizada correctamente', 'success');
  },

  /**
   * Confirmar eliminación de propiedad
   */
  showDeletePropertyConfirm(propertyId) {
    const property = Storage.getProperties().find(p => p.id === propertyId);
    if (!property) return;

    const contracts = Storage.getContractsByProperty(propertyId);

    const modalHTML = `
      <div class="modal-overlay" id="delete-property-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Eliminación</h3>
            <button class="modal-close" onclick="Modals.closeModal('delete-property-modal')">&times;</button>
          </div>
          <div class="modal-body">
            ${contracts.length > 0 ? `
              <div class="alert alert-danger">
                <strong>No se puede eliminar</strong><br>
                Esta propiedad tiene ${contracts.length} contrato(s) asociado(s). Debes eliminarlos primero.
              </div>
            ` : `
              <p>¿Estás seguro de que deseas eliminar esta propiedad?</p>
              <p><strong>${property.address}</strong></p>
              <p class="text-sm text-secondary">Esta acción no se puede deshacer.</p>
            `}
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('delete-property-modal')">
                Cancelar
              </button>
              ${contracts.length === 0 ? `
                <button type="button" class="btn btn-danger" onclick="Modals.deleteProperty('${propertyId}')">
                  Eliminar Propiedad
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Eliminar propiedad
   */
  deleteProperty(propertyId) {
    Storage.deleteProperty(propertyId);
    this.closeModal('delete-property-modal');
    App.navigate('properties');
    this.showToast('✅ Propiedad eliminada correctamente', 'success');
  },

  /**
   * Mostrar modal para registrar pago
   */
  showPaymentModal(paymentId) {
    const payment = Storage.getPayments().find(p => p.id === paymentId);
    if (!payment) return;

    const contract = Storage.getContracts().find(c => c.id === payment.contractId);
    const property = contract ? Storage.getProperties().find(p => p.id === contract.propertyId) : null;

    const modalHTML = `
      <div class="modal-overlay" id="payment-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Registrar Pago</h3>
            <button class="modal-close" onclick="Modals.closeModal('payment-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-lg">
              <strong>Propiedad:</strong> ${property?.address || 'N/A'}<br>
              <strong>Arrendatario:</strong> ${contract?.tenant?.name || 'N/A'}<br>
              <strong>Período:</strong> ${payment.month}<br>
              <strong>Monto:</strong> ${Calculator.formatCLP(payment.amount)}
            </div>
            
            <form id="payment-form">
              <input type="hidden" id="payment-id" value="${payment.id}">
              
              <div class="form-group">
                <label class="form-label form-label-required">Fecha de Pago</label>
                <input type="date" id="payment-date" class="form-input" required 
                       value="${new Date().toISOString().split('T')[0]}">
              </div>
              
              <div class="form-group">
                <label class="form-label form-label-required">Monto Pagado (CLP)</label>
                <input type="number" id="payment-amount" class="form-input" required 
                       value="${payment.amount}" min="0">
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('payment-modal')">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-success">
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('payment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.recordPayment();
    });
  },

  /**
   * Registrar pago
   */
  recordPayment() {
    const id = document.getElementById('payment-id').value;
    const paidDate = document.getElementById('payment-date').value;
    const amount = parseInt(document.getElementById('payment-amount').value);

    Payments.recordPayment(id, paidDate, amount);
    this.closeModal('payment-modal');
    App.navigate('payments');
    this.showToast('✅ Pago registrado correctamente', 'success');
  },

  /**
   * Confirmar eliminación de contrato
   */
  showDeleteContractConfirm(contractId) {
    const contract = Storage.getContracts().find(c => c.id === contractId);
    if (!contract) return;

    const property = Storage.getProperties().find(p => p.id === contract.propertyId);

    const modalHTML = `
      <div class="modal-overlay" id="delete-contract-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Eliminación</h3>
            <button class="modal-close" onclick="Modals.closeModal('delete-contract-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar este contrato?</p>
            <p><strong>${property?.address || 'Propiedad'}</strong> - ${contract.tenant.name}</p>
            <p class="text-sm text-secondary">Esto también eliminará todos los pagos asociados. Esta acción no se puede deshacer.</p>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="Modals.closeModal('delete-contract-modal')">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" onclick="Modals.deleteContract('${contractId}')">
                Eliminar Contrato
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Eliminar contrato
   */
  deleteContract(contractId) {
    const payments = Storage.getPaymentsByContract(contractId);
    payments.forEach(p => {
      const allPayments = Storage.getPayments();
      const filtered = allPayments.filter(pay => pay.id !== p.id);
      Storage.savePayments(filtered);
    });

    Storage.deleteContract(contractId);
    this.closeModal('delete-contract-modal');
    App.navigate('contracts');
    this.showToast('✅ Contrato eliminado correctamente', 'success');
  },

  /**
   * Cerrar modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  },

  /**
   * Mostrar mensaje toast
   */
  showToast(message, type = 'info') {
    const toastHTML = `
      <div class="toast toast-${type}" style="
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        padding: var(--space-lg);
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        border-left: 4px solid var(--color-${type === 'success' ? 'success' : 'info'});
        min-width: 300px;
      ">
        ${message}
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      const toast = document.querySelector('.toast');
      if (toast) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }
};

// Event listener para cerrar modales al hacer click fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.remove();
  }
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Modals;
}
