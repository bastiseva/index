// Users Management JavaScript

// Load all users
async function loadUsers(searchQuery = '') {
    const container = document.getElementById('usersTableContainer');
    container.innerHTML = '<div class="loading">Loading users...</div>';

    try {
        let users = await firebaseService.getCollection('users');

        // Apply search filter
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            users = users.filter(u =>
                u.name.toLowerCase().includes(search) ||
                u.phone.includes(search) ||
                (u.email && u.email.toLowerCase().includes(search))
            );
        }

        // Sort by join date (newest first)
        users.sort((a, b) => b.joinedAt - a.joinedAt);

        if (users.length === 0) {
            container.innerHTML = '<p class="text-center">No users found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Total Orders</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(user => {
            const joinDate = new Date(user.joinedAt || user.createdAt).toLocaleDateString();

            html += `
                <tr>
                    <td>#${user.id.substring(0, 8)}</td>
                    <td>${user.name}</td>
                    <td>${user.phone}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.totalOrders || 0}</td>
                    <td>${joinDate}</td>
                    <td>
                        <button class="btn-view" onclick="viewUser('${user.id}')">View</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p class="text-center">Error loading users</p>';
    }
}

// View user details
async function viewUser(userId) {
    try {
        const users = await firebaseService.getCollection('users');
        const user = users.find(u => u.id === userId);

        if (!user) {
            alert('User not found');
            return;
        }

        // Get user's orders
        const orders = await firebaseService.getCollection('orders');
        const userOrders = orders.filter(o => o.userId === userId);

        const modalContent = `
            <div style="max-width: 600px; background: white; padding: 30px; border-radius: 15px; margin: 50px auto;">
                <h2>User Details</h2>
                <hr style="margin: 20px 0;">

                <p><strong>User ID:</strong> #${user.id.substring(0, 8)}</p>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                <p><strong>Joined:</strong> ${new Date(user.joinedAt || user.createdAt).toLocaleDateString()}</p>

                <hr style="margin: 20px 0;">

                <h3>Order History (${userOrders.length} orders)</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${userOrders.length > 0 ? `
                        <table style="width: 100%; font-size: 12px;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 8px;">Order ID</th>
                                    <th style="padding: 8px;">Amount</th>
                                    <th style="padding: 8px;">Status</th>
                                    <th style="padding: 8px;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userOrders.map(order => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px;">#${order.id.substring(0, 8)}</td>
                                        <td style="padding: 8px;">₹${order.totalAmount}</td>
                                        <td style="padding: 8px;"><span class="status status-${order.status}">${order.status}</span></td>
                                        <td style="padding: 8px;">${new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No orders yet</p>'}
                </div>

                <button onclick="closeUserModal()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.id = 'userDetailModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;';
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error viewing user:', error);
        alert('Error loading user details');
    }
}

// Close user detail modal
function closeUserModal() {
    const modal = document.getElementById('userDetailModal');
    if (modal) {
        modal.remove();
    }
}

// Handle search
document.querySelector('.search-bar input')?.addEventListener('input', function(e) {
    loadUsers(e.target.value);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadUsers();
    }
});