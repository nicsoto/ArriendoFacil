/**
 * CONTRACTS.JS
 * Generación de documentos legales (contratos, anexos, cartas)
 */

const Contracts = {
  /**
   * Generar contrato de arriendo habitacional
   */
  generateLeaseContract(contract, property, landlord) {
    const tenant = contract.tenant;
    const guarantor = contract.guarantor;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Arriendo - ${property.address}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 40px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 14pt;
      margin-top: 20px;
    }
    .clause {
      margin-bottom: 15px;
      text-align: justify;
    }
    .clause-title {
      font-weight: bold;
      text-transform: uppercase;
    }
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature {
      text-align: center;
      width: 45%;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 10px;
    }
    .disclaimer {
      margin-top: 40px;
      padding: 20px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      font-size: 10pt;
    }
    @media print {
      .disclaimer { display: none; }
    }
  </style>
</head>
<body>
  <h1>CONTRATO DE ARRENDAMIENTO DE BIEN RAÍZ URBANO</h1>
  
  <p>En ${landlord.city || 'Santiago'}, a ${this.formatDate(new Date())}, entre ${landlord.name}, RUT ${landlord.rut}, domiciliado en ${landlord.address}, en adelante "EL ARRENDADOR", y ${tenant.name}, RUT ${tenant.rut}, domiciliado en ${tenant.address}, en adelante "EL ARRENDATARIO", se ha convenido el siguiente contrato de arrendamiento:</p>

  <div class="clause">
    <div class="clause-title">PRIMERO: INMUEBLE ARRENDADO</div>
    <p>EL ARRENDADOR da en arrendamiento a EL ARRENDATARIO la propiedad ubicada en ${property.address}, de tipo ${property.type}, con una superficie aproximada de ${property.size} m², para destino exclusivamente habitacional.</p>
  </div>

  <div class="clause">
    <div class="clause-title">SEGUNDO: PLAZO DEL ARRIENDO</div>
    ${this.getContractTypeClause(contract)}
  </div>

  <div class="clause">
    <div class="clause-title">TERCERO: RENTA DE ARRENDAMIENTO</div>
    <p>La renta mensual de arrendamiento será de ${Calculator.formatCLP(contract.monthlyRent)}, pagadera dentro de los primeros 5 días de cada mes, mediante transferencia bancaria a la cuenta indicada por EL ARRENDADOR.</p>
  </div>

  <div class="clause">
    <div class="clause-title">CUARTO: REAJUSTE DE LA RENTA</div>
    <p>La renta se reajustará ${this.getAdjustmentText(contract.adjustmentType)} al cumplirse cada período de 12 meses contados desde la fecha de inicio del contrato.</p>
  </div>

  <div class="clause">
    <div class="clause-title">QUINTO: GARANTÍA</div>
    <p>EL ARRENDATARIO entrega en este acto a EL ARRENDADOR la suma de ${Calculator.formatCLP(contract.deposit)} en calidad de garantía del fiel cumplimiento de las obligaciones del presente contrato. Conforme a la Ley N° 21.461, la garantía no podrá exceder el equivalente a dos meses de arriendo y deberá ser devuelta en un plazo máximo de 60 días corridos desde la restitución del inmueble, previa deducción de eventuales deudas.</p>
  </div>

  <div class="clause">
    <div class="clause-title">SEXTO: GASTOS COMUNES Y SERVICIOS</div>
    <p>Serán de cargo de EL ARRENDATARIO los gastos de consumo de servicios de agua, luz, gas y telefonía, así como los gastos comunes ordinarios del inmueble. Los gastos comunes extraordinarios serán de cargo de EL ARRENDADOR.</p>
  </div>

  <div class="clause">
    <div class="clause-title">SÉPTIMO: OBLIGACIONES DEL ARRENDATARIO</div>
    <p>EL ARRENDATARIO se obliga a:</p>
    <ul>
      <li>Pagar oportunamente la renta y los gastos a su cargo.</li>
      <li>Usar el inmueble exclusivamente para fines habitacionales.</li>
      <li>Mantener el inmueble en buen estado de conservación.</li>
      <li>Pagar las reparaciones locativas menores.</li>
      <li>${this.getSubleaseClause(contract)}</li>
      ${this.getPetsClause(contract)}
      <li>Restituir el inmueble al término del contrato en el mismo estado en que lo recibió${contract.furnished === 'amoblado' ? ', incluyendo todos los bienes muebles detallados en el inventario anexo' : ''}.</li>
    </ul>
  </div>

  <div class="clause">
    <div class="clause-title">OCTAVO: OBLIGACIONES DEL ARRENDADOR</div>
    <p>EL ARRENDADOR se obliga a:</p>
    <ul>
      <li>Entregar el inmueble en buen estado de conservación y habitabilidad.</li>
      <li>Realizar las reparaciones mayores necesarias para mantener el inmueble habitable.</li>
      <li>Respetar el uso pacífico del inmueble por parte de EL ARRENDATARIO.</li>
    </ul>
  </div>

  <div class="clause">
    <div class="clause-title">NOVENO: TÉRMINO ANTICIPADO</div>
    <p>El presente contrato podrá terminarse anticipadamente en los siguientes casos:</p>
    <ul>
      <li>Por mutuo acuerdo de las partes.</li>
      <li>Por falta de pago de dos o más períodos de renta.</li>
      <li>Por destrucción total o parcial del inmueble que lo haga inhabitable.</li>
      <li>Por desahucio dado por EL ARRENDADOR con la anticipación legal (conforme Ley N° 21.461).</li>
    </ul>
  </div>

  <div class="clause">
    <div class="clause-title">DÉCIMO: AVAL SOLIDARIO</div>
    ${guarantor ? `
      <p>${guarantor.name}, RUT ${guarantor.rut}, domiciliado en ${guarantor.address}, constituye aval solidario de EL ARRENDATARIO, obligándose solidariamente al pago de las rentas y al cumplimiento de todas las obligaciones emanadas del presente contrato.</p>
    ` : '<p>El presente contrato no contempla aval solidario.</p>'}
  </div>

  ${contract.furnished === 'amoblado' ? `
  <div class="clause">
    <div class="clause-title">DUODÉCIMO: CONDICIÓN DEL INMUEBLE</div>
    <p>El inmueble se arrienda en condición <strong>AMOBLADO</strong>. EL ARRENDATARIO recibe los bienes muebles y enseres detallados en el inventario anexo al presente contrato, obligándose a mantenerlos en buen estado de conservación y a restituirlos al término del arriendo.</p>
    <p><strong>Nota tributaria:</strong> Conforme a la normativa del Servicio de Impuestos Internos, el arriendo de inmuebles amoblados está gravado con IVA (19%).</p>
  </div>
  ` : ''}

  ${contract.hasInventory && contract.inventoryItems ? `
  <div class="clause">
    <div class="clause-title">${contract.furnished === 'amoblado' ? 'DECIMOTERCERO' : 'DUODÉCIMO'}: INVENTARIO</div>
    <p>Se adjunta al presente contrato un inventario detallado de los bienes incluidos en el arriendo y el estado actual del inmueble, el cual forma parte integrante de este contrato.</p>
  </div>
  ` : ''}

  <div class="clause">
    <div class="clause-title">${this.getLastClauseNumber(contract)}: DOMICILIO Y JURISDICCIÓN</div>
    <p>Para todos los efectos legales del presente contrato, las partes fijan domicilio en la ciudad de ${landlord.city || 'Santiago'} y se someten a la jurisdicción de sus Tribunales de Justicia.</p>
  </div>

  <div class="signature-section">
    <div class="signature">
      <div class="signature-line">
        <strong>${landlord.name}</strong><br>
        RUT: ${landlord.rut}<br>
        EL ARRENDADOR
      </div>
    </div>
    <div class="signature">
      <div class="signature-line">
        <strong>${tenant.name}</strong><br>
        RUT: ${tenant.rut}<br>
        EL ARRENDATARIO
      </div>
    </div>
  </div>

  ${guarantor ? `
  <div style="margin-top: 40px; text-align: center;">
    <div class="signature" style="width: 45%; margin: 0 auto;">
      <div class="signature-line">
        <strong>${guarantor.name}</strong><br>
        RUT: ${guarantor.rut}<br>
        AVAL SOLIDARIO
      </div>
    </div>
  </div>
  ` : ''}

  <div class="disclaimer">
    <strong>AVISO LEGAL:</strong> Este documento es una plantilla informativa generada por la aplicación ArriendoFácil. No constituye asesoría legal profesional. Se recomienda que este contrato sea revisado por un abogado antes de su firma para asegurar que cumple con todos los requisitos legales vigentes y se adapta a las necesidades particulares de las partes.
  </div>

  ${contract.hasInventory && contract.inventoryItems ? `
  <div style="page-break-before: always;"></div>
  <h1 style="text-align: center; margin-top: 40px;">ANEXO: INVENTARIO Y ACTA DE ENTREGA</h1>
  
  <p>En ${landlord.city || 'Santiago'}, a ${this.formatDate(new Date())}, se hace entrega del inmueble ubicado en <strong>${property.address}</strong> al arrendatario <strong>${tenant.name}</strong>, RUT ${tenant.rut}, constando el siguiente inventario:</p>
  
  <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-family: monospace;">
${contract.inventoryItems}
  </div>
  
  <p>Ambas partes declaran estar conformes con el estado del inmueble y los bienes inventariados al momento de la entrega.</p>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; margin-top: 60px; padding-top: 10px;">
        <strong>${landlord.name}</strong><br>
        RUT: ${landlord.rut}<br>
        EL ARRENDADOR
      </div>
    </div>
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; margin-top: 60px; padding-top: 10px;">
        <strong>${tenant.name}</strong><br>
        RUT: ${tenant.rut}<br>
        EL ARRENDATARIO
      </div>
    </div>
  </div>
  ` : ''}

</body>
</html>
    `;
  },

  /**
   * Generar anexo de modificación de renta (reajuste)
   */
  generateRentAdjustmentAnnex(contract, property, landlord, adjustment) {
    const tenant = contract.tenant;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Anexo de Reajuste - ${property.address}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 40px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
    }
    .calculation {
      background: #fff;
      border: 1px solid #ddd;
      padding: 15px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    td:first-child {
      font-weight: bold;
      width: 40%;
    }
  </style>
</head>
<body>
  <h1>ANEXO DE MODIFICACIÓN DE RENTA<br>REAJUSTE ANUAL</h1>

  <p>En ${landlord.city || 'Santiago'}, a ${this.formatDate(new Date())}, entre ${landlord.name}, RUT ${landlord.rut}, en adelante "EL ARRENDADOR", y ${tenant.name}, RUT ${tenant.rut}, en adelante "EL ARRENDATARIO", en relación al contrato de arrendamiento del inmueble ubicado en ${property.address}, se acuerda lo siguiente:</p>

  <div class="info-box">
    <p><strong>REAJUSTE DE RENTA CONFORME A CONTRATO</strong></p>
    <p>En conformidad con la cláusula cuarta del contrato de arrendamiento suscrito con fecha ${this.formatDate(contract.startDate)}, corresponde realizar el reajuste anual de la renta.</p>
  </div>

  <div class="calculation">
    <h3>CÁLCULO DEL REAJUSTE</h3>
    
    <table>
      <tr>
        <td>Renta mensual actual:</td>
        <td>${Calculator.formatCLP(adjustment.originalAmount)}</td>
      </tr>
      <tr>
        <td>Tipo de reajuste:</td>
        <td>${contract.adjustmentType}</td>
      </tr>
      ${adjustment.ipcStart ? `
      <tr>
        <td>IPC fecha inicio (${this.formatDate(adjustment.startDate)}):</td>
        <td>${adjustment.ipcStart}</td>
      </tr>
      <tr>
        <td>IPC fecha actual (${this.formatDate(adjustment.endDate)}):</td>
        <td>${adjustment.ipcEnd}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Variación:</td>
        <td>${Calculator.formatPercent(adjustment.variation)}</td>
      </tr>
      <tr style="font-size: 14pt; background: #f8f9fa;">
        <td><strong>Nueva renta mensual:</strong></td>
        <td><strong>${Calculator.formatCLP(adjustment.newAmount)}</strong></td>
      </tr>
    </table>
  </div>

  <p><strong>La nueva renta de ${Calculator.formatCLP(adjustment.newAmount)} comenzará a regir a partir del ${this.formatDate(this.getNextMonth())}.</strong></p>

  <p>Ambas partes ratifican las demás cláusulas del contrato original que no se oponen al presente anexo.</p>

  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; margin-top: 60px; padding-top: 10px;">
        <strong>${landlord.name}</strong><br>
        RUT: ${landlord.rut}<br>
        EL ARRENDADOR
      </div>
    </div>
    <div style="text-align: center; width: 45%;">
      <div style="border-top: 1px solid #000; margin-top: 60px; padding-top: 10px;">
        <strong>${tenant.name}</strong><br>
        RUT: ${tenant.rut}<br>
        EL ARRENDATARIO
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * Generar carta de término de contrato
   */
  generateTerminationLetter(contract, property, landlord, reason = 'término de plazo') {
    const tenant = contract.tenant;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Carta de Término - ${property.address}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 40px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
    }
    .letter-header {
      margin-bottom: 30px;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>CARTA DE TÉRMINO DE CONTRATO DE ARRENDAMIENTO</h1>

  <div class="letter-header">
    <p>${landlord.city || 'Santiago'}, ${this.formatDate(new Date())}</p>
    <p>
      <strong>Señor(a):</strong> ${tenant.name}<br>
      <strong>RUT:</strong> ${tenant.rut}<br>
      <strong>Domicilio:</strong> ${property.address}
    </p>
  </div>

  <p>Estimado(a) ${tenant.name}:</p>

  <p>Por medio de la presente, yo, ${landlord.name}, RUT ${landlord.rut}, en mi calidad de arrendador del inmueble ubicado en ${property.address}, le comunico formalmente mi decisión de <strong>poner término al contrato de arrendamiento</strong> suscrito con fecha ${this.formatDate(contract.startDate)}.</p>

  <p><strong>Motivo:</strong> ${reason}</p>

  <p>Conforme a lo establecido en la Ley N° 18.101 y el contrato vigente, se le solicita hacer entrega material del inmueble el día <strong>${this.formatDate(contract.endDate)}</strong>, en las mismas condiciones en que lo recibió, salvo el deterioro por el uso normal.</p>

  <div class="info-box">
    <strong>INSTRUCCIONES PARA LA ENTREGA:</strong>
    <ul>
      <li>Agendar inspección previa con 7 días de anticipación.</li>
      <li>El inmueble debe ser entregado limpio y en buenas condiciones.</li>
      <li>Entregar todas las llaves y controles remotos.</li>
      <li>Presentar comprobantes de pago de servicios básicos al día.</li>
      <li>Estar al día en el pago de gastos comunes.</li>
    </ul>
  </div>

  <p>La garantía de arriendo será devuelta en un plazo máximo de 60 días corridos desde la restitución del inmueble, conforme a la Ley N° 21.461, previa deducción de eventuales deudas por daños, reparaciones o pagos pendientes.</p>

  <p>Quedo atento a coordinar los detalles de la entrega.</p>

  <p>Saluda atentamente,</p>

  <div style="margin-top: 60px;">
    <div style="border-top: 1px solid #000; width: 300px; padding-top: 10px;">
      <strong>${landlord.name}</strong><br>
      RUT: ${landlord.rut}<br>
      Teléfono: ${landlord.phone || '_______________'}<br>
      Email: ${landlord.email || '_______________'}
    </div>
  </div>
</body>
</html>
    `;
  },

  // === UTILIDADES ===

  formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('es-CL', options);
  },

  calculateMonths(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  },

  getNextMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  },

  getAdjustmentText(type) {
    const texts = {
      'IPC': 'según la variación del Índice de Precios al Consumidor (IPC) determinado por el Instituto Nacional de Estadísticas',
      'UF': 'según la variación de la Unidad de Fomento (UF)',
      'fixed': 'sin reajuste, manteniéndose el valor inicial'
    };
    return texts[type] || texts.fixed;
  },

  /**
   * Generar cláusula según tipo de contrato
   */
  getContractTypeClause(contract) {
    const contractType = contract.contractType || 'plazo_fijo';
    const startDate = this.formatDate(contract.startDate);
    const endDate = this.formatDate(contract.endDate);
    const months = this.calculateMonths(contract.startDate, contract.endDate);

    switch (contractType) {
      case 'mes_a_mes':
        return `
          <p>El presente contrato se celebra <strong>mes a mes</strong>, comenzando el ${startDate}.</p>
          <p>Cualquiera de las partes podrá ponerle término mediante aviso escrito con al menos 30 días de anticipación al término del mes respectivo.</p>
        `;
      case 'indefinido':
        return `
          <p>El presente contrato se celebra por <strong>tiempo indefinido</strong>, comenzando el ${startDate}.</p>
          <p>Conforme a la Ley N° 18.101, EL ARRENDADOR podrá poner término al contrato mediante desahucio judicial o notificación notarial, debiendo dar aviso con la anticipación que corresponda según la duración del arriendo.</p>
        `;
      case 'plazo_fijo':
      default:
        return `
          <p>El plazo del presente contrato será de ${months} meses, comenzando el ${startDate} y finalizando el ${endDate}.</p>
          <p>Conforme a la Ley N° 18.101, el plazo mínimo será de un año para propiedades urbanas. En caso de no existir desahucio, se entenderá prorrogado por períodos iguales.</p>
        `;
    }
  },

  /**
   * Generar cláusula de subarriendo
   */
  getSubleaseClause(contract) {
    const sublease = contract.sublease || 'prohibido';
    if (sublease === 'permitido') {
      return 'Podrá subarrendar el inmueble previa autorización escrita de EL ARRENDADOR.';
    }
    return 'No podrá subarrendar ni ceder el contrato total o parcialmente sin autorización escrita de EL ARRENDADOR.';
  },

  /**
   * Generar cláusula de mascotas
   */
  getPetsClause(contract) {
    const pets = contract.pets || 'prohibidas';
    switch (pets) {
      case 'permitidas':
        return '<li>Se permite la tenencia de mascotas en el inmueble, siendo EL ARRENDATARIO responsable de cualquier daño que estas pudieran ocasionar.</li>';
      case 'con_restriccion':
        return '<li>Se permite la tenencia de mascotas pequeñas (máximo 10 kg) previa autorización escrita de EL ARRENDADOR, siendo EL ARRENDATARIO responsable de cualquier daño.</li>';
      case 'prohibidas':
      default:
        return '<li>No se permite la tenencia de mascotas en el inmueble.</li>';
    }
  },

  /**
   * Obtener el número de la última cláusula según las opciones
   */
  getLastClauseNumber(contract) {
    let number = 11; // Base: UNDÉCIMO
    if (contract.furnished === 'amoblado') number++;
    if (contract.hasInventory && contract.inventoryItems) number++;

    const ordinals = {
      11: 'UNDÉCIMO',
      12: 'DUODÉCIMO',
      13: 'DECIMOTERCERO',
      14: 'DECIMOCUARTO'
    };
    return ordinals[number] || `CLÁUSULA ${number}`;
  },

  /**
   * Abrir documento en nueva ventana para imprimir/guardar PDF
   */
  openDocument(htmlContent) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    // Esperar a que cargue y luego mostrar diálogo de impresión
    printWindow.onload = () => {
      printWindow.focus();
    };
  }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Contracts;
}
