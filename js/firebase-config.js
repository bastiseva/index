// Firebase Configuration
// Replace with your Firebase config

const firebaseConfig = {
    apiKey: "AIzaSyDUIQGpAFQQreAU9Pz-A0V_sz6Ajw5og6g",
    authDomain: "bastiseva-c5a6a.firebaseapp.com",
    projectId: "bastiseva-c5a6a",
    storageBucket: "bastiseva-c5a6a.firebasestorage.app",
    messagingSenderId: "784869695830",
    appId: "1:784869695830:web:f6fd89a2079bf0a388f6f7"
};

// Initialize Firebase (if using Firebase SDK)
// This is a placeholder - actual implementation would use Firebase SDK

class FirebaseService {
    constructor() {
        this.db = null;
        console.log('Firebase Service initialized');
    }

    // Get all documents from a collection
    async getCollection(collectionName) {
        console.log(`Fetching ${collectionName}...`);

        // Demo data - replace with actual Firebase calls
        const demoData = {
            shops: [
                {
                    id: 'shop1',
                    name: 'Green Kitchen',
                    category: 'food_veg',
                    phone: '9876543210',
                    address: 'Sector 12, Noida',
                    isActive: true
                },
                {
                    id: 'shop2',
                    name: 'Medical Store',
                    category: 'medicine',
                    phone: '9876543211',
                    address: 'Sector 15, Noida',
                    isActive: true
                }
            ],
            products: [
                {
                    id: 'prod1',
                    name: 'Paneer Butter Masala',
                    shopId: 'shop1',
                    price: 150,
                    unit: 'plate',
                    isAvailable: true
                },
                {
                    id: 'prod2',
                    name: 'Paracetamol 500mg',
                    shopId: 'shop2',
                    price: 20,
                    unit: 'strip',
                    isAvailable: true
                }
            ],
            orders: [
                {
                    id: 'ord1',
                    customerId: 'user1',
                    customerName: 'John Doe',
                    shopId: 'shop1',
                    totalAmount: 350,
                    status: 'pending',
                    createdAt: Date.now()
                }
            ],
            users: [
                {
                    id: 'user1',
                    name: 'John Doe',
                    phone: '+91 9999999999',
                    email: 'john@example.com',
                    totalOrders: 12,
                    joinedAt: Date.now()
                }
            ]
        };

        return demoData[collectionName] || [];
    }

    // Add document to collection
    async addDocument(collectionName, data) {
        console.log(`Adding to ${collectionName}:`, data);
        return { success: true, id: 'new_id_' + Date.now() };
    }

    // Update document
    async updateDocument(collectionName, docId, data) {
        console.log(`Updating ${collectionName}/${docId}:`, data);
        return { success: true };
    }

    // Delete document
    async deleteDocument(collectionName, docId) {
        console.log(`Deleting ${collectionName}/${docId}`);
        return { success: true };
    }

    // Get statistics
    async getStats() {
        return {
            totalOrders: 156,
            totalShops: 12,
            totalProducts: 87,
            totalUsers: 234
        };
    }
}

// Export instance
const firebaseService = new FirebaseService();