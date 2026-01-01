import axios from 'axios';

// Configuration de base (Gateway)
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le Token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
//              ESPACE PUBLIC
// ==========================================
export const trackOrderPublic = async (trackingNumber) => {
    const response = await api.get(`/order-service/api/orders/track/${trackingNumber}`);
    return response.data;
};

// ==========================================
//              ESPACE CLIENT
// ==========================================

// 1. Récupérer le profil Client via email
export const getCustomerProfile = async (email) => {
    const response = await api.get(`/customer-service/api/customers/search?email=${email}`);
    return response.data;
};

// 2. Mettre à jour le profil Client
export const updateCustomerProfile = async (id, data) => {
    const response = await api.put(`/customer-service/api/customers/${id}`, data);
    return response.data;
};

// 3. Récupérer les produits (Catalogue)
export const getProducts = async () => {
    const response = await api.get('/product-service/api/products');
    return response.data;
};

// 4. Créer une commande
export const createOrder = async (orderData) => {
    const response = await api.post('/order-service/api/orders', orderData);
    return response.data;
};

// 5. Récupérer les commandes d'un client spécifique
export const getOrdersByCustomer = async (customerId) => {
    const response = await api.get(`/order-service/api/orders/customer/${customerId}`);
    return response.data;
};

// 6. Supprimer/Annuler une commande (C'EST CELLE QUI MANQUAIT)
export const deleteOrder = async (id) => {
    await api.delete(`/order-service/api/orders/${id}`);
};


// ==========================================
//              ESPACE LIVREUR
// ==========================================

// 1. Récupérer le profil Livreur via email
export const getDriverProfile = async (email) => {
    const response = await api.get(`/delivery-service/api/deliveries/drivers/search?email=${email}`);
    return response.data;
};

// 2. Mettre à jour le profil Livreur
export const updateDriverProfile = async (id, data) => {
    const response = await api.put(`/delivery-service/api/deliveries/drivers/${id}`, data);
    return response.data;
};

// 3. Récupérer les courses d'un livreur spécifique
export const getDriverDeliveries = async (driverId) => {
    const response = await api.get(`/delivery-service/api/deliveries?driverId=${driverId}`);
    return response.data;
};

// 4. Changer le statut d'une livraison (PICKED_UP, DELIVERED...)
export const updateDeliveryStatus = async (deliveryId, status) => {
    const response = await api.put(`/delivery-service/api/deliveries/${deliveryId}/status?status=${status}`);
    return response.data;
};


// ==========================================
//              ESPACE ADMIN
// ==========================================

// --- GESTION CLIENTS ---
export const getAllCustomers = async () => {
    const response = await api.get('/customer-service/api/customers');
    return response.data;
};

export const deleteCustomer = async (id) => {
    await api.delete(`/customer-service/api/customers/${id}`);
};

// --- GESTION LIVREURS ---
export const getAllDrivers = async () => {
    const response = await api.get('/delivery-service/api/deliveries/drivers/all');
    return response.data;
};

export const deleteDriver = async (id) => {
    await api.delete(`/delivery-service/api/deliveries/drivers/${id}`);
};

// --- GESTION COMMANDES ---
export const getAllOrders = async () => {
    const response = await api.get('/order-service/api/orders');
    return response.data;
};

// --- GESTION LIVRAISONS & ASSIGNATION ---
export const getAllDeliveries = async () => {
    const response = await api.get('/delivery-service/api/deliveries/all');
    return response.data;
};

export const assignDriverToDelivery = async (deliveryId, driverId) => {
    const response = await api.put(`/delivery-service/api/deliveries/${deliveryId}/assign/${driverId}`);
    return response.data;
};

export const deleteDelivery = async (id) => {
    await api.delete(`/delivery-service/api/deliveries/${id}`);
};

// --- GESTION PRODUITS (CRUD) ---
export const addProduct = async (productData) => {
    const response = await api.post('/product-service/api/products', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/product-service/api/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    await api.delete(`/product-service/api/products/${id}`);
};

export const validateDriver = async (id) => {
    const response = await api.put(`/delivery-service/api/deliveries/drivers/${id}/validate`);
    return response.data;
};

export default api;