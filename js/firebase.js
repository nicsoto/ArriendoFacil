/**
 * FIREBASE.JS
 * Configuración y conexión con Firebase
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un nuevo proyecto (ej: "platita-app")
 * 3. En "Build" > "Authentication", habilita "Google" como proveedor
 * 4. En "Build" > "Firestore Database", crea una base de datos en modo "test"
 * 5. En "Project Settings" > "General", baja hasta "Your apps" y crea una "Web app"
 * 6. Copia los valores de firebaseConfig y pégalos abajo
 */

// ⚠️ REEMPLAZA ESTOS VALORES CON TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase (se hace cuando se cargan los scripts de Firebase)
let app, auth, db;

const FirebaseService = {
    currentUser: null,
    isInitialized: false,

    /**
     * Inicializar Firebase
     */
    init() {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK no cargado. La app funcionará en modo local.');
            return false;
        }

        try {
            // Verificar si ya está inicializado
            if (!firebase.apps.length) {
                app = firebase.initializeApp(firebaseConfig);
            } else {
                app = firebase.apps[0];
            }

            auth = firebase.auth();
            db = firebase.firestore();

            // Escuchar cambios de autenticación
            auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.onAuthChange(user);
            });

            this.isInitialized = true;
            console.log('✅ Firebase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return false;
        }
    },

    /**
     * Callback cuando cambia el estado de autenticación
     */
    onAuthChange(user) {
        const loginBtn = document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');

        if (user) {
            // Usuario logueado
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = user.displayName || user.email;
            if (userAvatar) userAvatar.src = user.photoURL || '';

            // Cargar datos del usuario desde Firestore
            this.loadUserData();
        } else {
            // Usuario no logueado
            if (loginBtn) loginBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
        }
    },

    /**
     * Login con Google
     */
    async loginWithGoogle() {
        if (!this.isInitialized) {
            alert('Firebase no está configurado. La app funciona en modo local.');
            return null;
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            console.log('✅ Login exitoso:', result.user.email);
            return result.user;
        } catch (error) {
            console.error('❌ Error en login:', error);
            alert('Error al iniciar sesión: ' + error.message);
            return null;
        }
    },

    /**
     * Logout
     */
    async logout() {
        if (!this.isInitialized) return;

        try {
            await auth.signOut();
            console.log('✅ Logout exitoso');
            // Limpiar datos locales
            localStorage.removeItem('platita_properties');
            localStorage.removeItem('platita_contracts');
            localStorage.removeItem('platita_payments');
            window.location.reload();
        } catch (error) {
            console.error('❌ Error en logout:', error);
        }
    },

    /**
     * Obtener referencia a la colección del usuario actual
     */
    getUserCollection(collection) {
        if (!this.currentUser) return null;
        return db.collection('users').doc(this.currentUser.uid).collection(collection);
    },

    /**
     * Cargar todos los datos del usuario desde Firestore
     */
    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Cargar propiedades
            const propsSnapshot = await this.getUserCollection('properties').get();
            const properties = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem('platita_properties', JSON.stringify(properties));

            // Cargar contratos
            const contractsSnapshot = await this.getUserCollection('contracts').get();
            const contracts = contractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem('platita_contracts', JSON.stringify(contracts));

            // Cargar pagos
            const paymentsSnapshot = await this.getUserCollection('payments').get();
            const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            localStorage.setItem('platita_payments', JSON.stringify(payments));

            // Cargar configuración
            const settingsDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (settingsDoc.exists) {
                localStorage.setItem('platita_settings', JSON.stringify(settingsDoc.data().settings || {}));
            }

            console.log('✅ Datos cargados desde la nube');

            // Refrescar la vista
            if (typeof App !== 'undefined') {
                App.navigate(App.currentView);
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    },

    /**
     * Guardar un documento en Firestore
     */
    async saveDocument(collection, id, data) {
        if (!this.currentUser || !this.isInitialized) return false;

        try {
            await this.getUserCollection(collection).doc(id).set(data, { merge: true });
            console.log(`✅ ${collection}/${id} guardado en la nube`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${collection}/${id}:`, error);
            return false;
        }
    },

    /**
     * Eliminar un documento de Firestore
     */
    async deleteDocument(collection, id) {
        if (!this.currentUser || !this.isInitialized) return false;

        try {
            await this.getUserCollection(collection).doc(id).delete();
            console.log(`✅ ${collection}/${id} eliminado de la nube`);
            return true;
        } catch (error) {
            console.error(`❌ Error eliminando ${collection}/${id}:`, error);
            return false;
        }
    },

    /**
     * Sincronizar datos locales a la nube
     */
    async syncToCloud() {
        if (!this.currentUser || !this.isInitialized) {
            console.log('⚠️ No hay usuario logueado, datos solo locales');
            return false;
        }

        try {
            // Sincronizar propiedades
            const properties = JSON.parse(localStorage.getItem('platita_properties') || '[]');
            for (const prop of properties) {
                await this.saveDocument('properties', prop.id, prop);
            }

            // Sincronizar contratos
            const contracts = JSON.parse(localStorage.getItem('platita_contracts') || '[]');
            for (const contract of contracts) {
                await this.saveDocument('contracts', contract.id, contract);
            }

            // Sincronizar pagos
            const payments = JSON.parse(localStorage.getItem('platita_payments') || '[]');
            for (const payment of payments) {
                await this.saveDocument('payments', payment.id, payment);
            }

            // Sincronizar configuración
            const settings = JSON.parse(localStorage.getItem('platita_settings') || '{}');
            await db.collection('users').doc(this.currentUser.uid).set({ settings }, { merge: true });

            console.log('✅ Todos los datos sincronizados a la nube');
            return true;
        } catch (error) {
            console.error('❌ Error sincronizando:', error);
            return false;
        }
    }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
}
