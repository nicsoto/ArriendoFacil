# ArriendoFácil - Herramienta para Arrendadores

## 🏠 ¿Qué es ArriendoFácil?

ArriendoFácil es una aplicación web diseñada para pequeños arrendadores de propiedades en Chile (personas que arriendan 1-3 propiedades). Simplifica la gestión de arriendos con herramientas para:

- ✅ Calcular reajustes automáticos (IPC/UF)
- ✅ Generar contratos legales
- ✅ Registrar pagos y enviar recordatorios
- ✅ Calcular impuestos para el SII
- ✅ Alertas inteligentes

## 🚀 Inicio Rápido

### Abrir la Aplicación

1. Abrir `index.html` en tu navegador
2. (Opcional) Cargar datos de prueba desde la consola ejecutando `demo-data.js`

### Primer Uso

1. **Configuración**: Ir a "Configuración" y completar tus datos personales
2. **Agregar Propiedad**: Ir a "Propiedades" → Click en "Agregar Propiedad"
3. **Crear Contrato**: Ir a "Contratos" → Click en "Nuevo Contrato"

## 📁 Estructura del Proyecto

```
platita/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos completos
├── js/
│   ├── app.js          # Aplicación principal
│   ├── storage.js      # Persistencia
│   ├── calculator.js   # Cálculos IPC/UF
│   ├── contracts.js    # Generación documentos
│   ├── payments.js     # Gestión pagos
│   ├── alerts.js       # Alertas
│   ├── taxes.js        # Impuestos SII
│   └── views.js        # Vistas HTML
└── demo-data.js        # Datos de prueba
```

## 💻 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Persistencia**: LocalStorage
- **API Externa**: Mindicador.cl (IPC/UF)
- **No requiere**: Backend, base de datos, frameworks

## 🔑 Características Principales

### Calculadora de Reajustes
Calcula reajustes de arriendo usando datos en tiempo real del IPC/UF desde Mindicador.cl

### Generación de Documentos
Genera contratos, anexos y cartas conformes a:
- Ley N° 18.101 (Arrendamiento de Predios Urbanos)
- Ley N° 21.461 ("Devuélveme mi Casa")

### Sistema de Alertas
Notifica automáticamente sobre:
- Pagos atrasados
- Contratos próximos a vencer
- Reajustes pendientes

### Calculadora SII
Calcula impuestos considerando:
- Beneficio DFL-2 (primeras 2 propiedades exentas)
- Exportación para contador

## 📝 Notas Legales

Los documentos generados son **plantillas informativas**. Se recomienda revisión por un abogado antes de uso oficial.

## 🔒 Privacidad

Todos los datos se guardan localmente en tu navegador. No se envían a ningún servidor externo.

**Importante**: Exporta respaldos regularmente desde "Configuración" → "Exportar Datos".

## 📞 Soporte

Este es un proyecto de código abierto sin soporte oficial. Úsalo bajo tu propia responsabilidad.

## 📄 Licencia

Libre para uso personal y comercial.
