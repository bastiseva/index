// Orders Management JavaScript

let currentOrderId = null;

// Load all orders
async function loadOrders(filters = {}) {
    const container = document.getElementById('ordersTableContainer');
    container.innerHTML = '<div class="loading">Loading orders...</div>';

    try {
        let orders = await firebaseService.getCollection('orders');

        // Apply filters
        if (filters.status) {
            orders = orders.filter(o => o.status === filters.status);
        }
        if (filters.date) {
            const filterDate = new Date(filters.date).toDateString();
            orders = orders.filter(o => {
                const orderDate = new Date(o.createdAt).toDateString();
                return orderDate === filterDate;
            });
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            orders = orders.filter(o =>
                o.id.toLowerCase().includes(search) ||
                o.customerName.toLowerCase().includes(search) ||
                o.customerMobile.includes(search)
            );
        }

        // Sort by date (newest first)
        orders.sort((a, b) => b.createdAt - a.createdAt);

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
                        <th>Phone</th>
                        <th>Shop</th>
                        <th>Module</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleString();
            const statusClass = `status-${order.status}`;

            html += `
                <tr>
                    <td>#${order.id.substring(0, 8).toUpperCase()}</td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${order.customerMobile || 'N/A'}</td>
                    <td>${order.shopName || 'N/A'}</td>
                    <td>${order.module || 'N/A'}</td>
                    <td>₹${order.totalAmount}</td>
                    <td>${order.paymentMethod === 'online' ? 'Online' : 'COD'}</td>
                    <td><span class="status ${statusClass}">${order.status}</span></td>
                    <td>${date}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-view" onclick="viewOrder('${order.id}')">View</button>
                            <button class="btn-edit" onclick="updateOrderStatus('${order.id}')">Update</button>
                        </div>
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
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="text-center">Error loading orders</p>';
    }
}

// View order details
async function viewOrder(orderId) {
    try {
        const orders = await firebaseService.getCollection('orders');
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            alert('Order not found');
            return;
        }

        // Create detailed order view
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = '<h4>Order Items:</h4><ul style="list-style: none; padding: 0;">';
            order.items.forEach(item => {
                itemsHtml += `
                    <li style="padding: 8px; border-bottom: 1px solid #eee;">
                        ${item.productName || item.medicineName || 'Item'}
                        ${item.variant ? `(${item.variant})` : ''}
                        - Qty: ${item.quantity}
                        - ₹${item.price} x ${item.quantity} = ₹${item.total || item.price * item.quantity}
                    </li>
                `;
            });
            itemsHtml += '</ul>';
        }

        const modalContent = `
            <div style="max-width: 600px; background: white; padding: 30px; border-radius: 15px; margin: 50px auto;">
                <h2>Order Details</h2>
                <hr style="margin: 20px 0;">

                <p><strong>Order ID:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customerMobile || 'N/A'}</p>
                <p><strong>Shop:</strong> ${order.shopName || 'N/A'}</p>
                <p><strong>Module:</strong> ${order.module || 'N/A'}</p>

                <hr style="margin: 20px 0;">

                ${itemsHtml}

                <hr style="margin: 20px 0;">

                <p><strong>Booking Charge:</strong> ₹${order.bookingCharge || 0}</p>
                <p><strong>Delivery Charge:</strong> ₹${order.deliveryCharge || 0}</p>
                <p><strong>COD Charge:</strong> ₹${order.codCharge || 0}</p>
                <p style="font-size: 18px;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

                <hr style="margin: 20px 0;">

                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery'}</p>
                <p><strong>Payment ID:</strong> ${order.paymentId || 'N/A'}</p>
                <p><strong>Status:</strong> <span class="status status-${order.status}">${order.status}</span></p>
                <p><strong>Distance:</strong> ${order.distance ? order.distance.toFixed(2) + ' km' : 'N/A'}</p>

                <hr style="margin: 20px 0;">

                <h4>Delivery Address:</h4>
                <p>${order.address ? order.address.fullAddress : 'N/A'}</p>
                <p>${order.address ? order.address.zipCode + ', ' + order.address.state : ''}</p>

                <button onclick="closeOrderModal()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.id = 'orderDetailModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;';
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error viewing order:', error);
        alert('Error loading order details');
    }
}

// Close order detail modal
function closeOrderModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.remove();
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'];
    const currentStatus = await getCurrentOrderStatus(orderId);

    const statusOptions = statuses.map(status => {
        const selected = status === currentStatus ? 'selected' : '';
        return `<option value="${status}" ${selected}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`;
    }).join('');

    const modalContent = `
        <div style="max-width: 400px; background: white; padding: 30px; border-radius: 15px; margin: 100px auto;">
            <h3>Update Order Status</h3>
            <p style="margin: 20px 0;">Order ID: #${orderId.substring(0, 8).toUpperCase()}</p>

            <select id="newStatus" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
                ${statusOptions}
            </select>

            <div style="display: flex; gap: 10px;">
                <button onclick="closeStatusModal()" style="flex: 1; padding: 12px; background: #e0e0e0; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
                <button onclick="confirmStatusUpdate('${orderId}')" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Update</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'statusUpdateModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

// Get current order status
async function getCurrentOrderStatus(orderId) {
    try {
        const orders = await firebaseService.getCollection('orders');
        const order = orders.find(o => o.id === orderId);
        return order ? order.status : 'pending';
    } catch (error) {
        return 'pending';
    }
}

// Close status modal
function closeStatusModal() {
    const modal = document.getElementById('statusUpdateModal');
    if (modal) {
        modal.remove();
    }
}

// Confirm status update
async function confirmStatusUpdate(orderId) {
    const newStatus = document.getElementById('newStatus').value;

    try {
        await firebaseService.updateDocument('orders', orderId, { status: newStatus });
        alert('Order status updated successfully!');
        closeStatusModal();
        loadOrders();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating order status');
    }
}

// Handle filters
document.querySelector('.filter-bar input[type="text"]')?.addEventListener('input', function(e) {
    const filters = {
        search: e.target.value,
        status: document.querySelector('.filter-bar select').value,
        date: document.querySelector('.filter-bar input[type="date"]').value
    };
    loadOrders(filters);
});

document.querySelector('.filter-bar select')?.addEventListener('change', function(e) {
    const filters = {
        search: document.querySelector('.filter-bar input[type="text"]').value,
        status: e.target.value,
        date: document.querySelector('.filter-bar input[type="date"]').value
    };
    loadOrders(filters);
});

document.querySelector('.filter-bar input[type="date"]')?.addEventListener('change', function(e) {
    const filters = {
        search: document.querySelector('.filter-bar input[type="text"]').value,
        status: document.querySelector('.filter-bar select').value,
        date: e.target.value
    };
    loadOrders(filters);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadOrders();
    }
});