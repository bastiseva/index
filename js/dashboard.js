// Dashboard JavaScript

// Check authentication
function checkAuth() {
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminEmail');
        window.location.href = 'index.html';
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        // Get stats from Firebase or demo data
        const stats = await firebaseService.getStats();

        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalShops').textContent = stats.totalShops;
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent orders
async function loadRecentOrders() {
    const container = document.getElementById('ordersTableContainer');
    container.innerHTML = '<div class="loading">Loading orders...</div>';

    try {
        const orders = await firebaseService.getCollection('orders');

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-center">No orders found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Shop</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        orders.slice(0, 10).forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString();
            const statusClass = `status-${order.status}`;

            html += `
                <tr>
                    <td>#${order.id.substring(0, 8).toUpperCase()}</td>
                    <td>${order.customerName}</td>
                    <td>${order.shopName || 'N/A'}</td>
                    <td>₹${order.totalAmount}</td>
                    <td><span class="status ${statusClass}">${order.status}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="text-center">Error loading orders</p>';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadDashboardStats();
        loadRecentOrders();
    }
});