// Shops Management JavaScript

let currentShopId = null;

// Load all shops
async function loadShops() {
    const container = document.getElementById('shopsTableContainer');
    container.innerHTML = '<div class="loading">Loading shops...</div>';

    try {
        const shops = await firebaseService.getCollection('shops');

        if (shops.length === 0) {
            container.innerHTML = '<p class="text-center">No shops found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Shop ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        shops.forEach(shop => {
            const statusClass = shop.isActive ? 'badge-active' : 'badge-inactive';
            const statusText = shop.isActive ? 'Active' : 'Inactive';

            html += `
                <tr>
                    <td>#${shop.id.substring(0, 8)}</td>
                    <td>${shop.name}</td>
                    <td>${shop.category}</td>
                    <td>${shop.phone}</td>
                    <td>${shop.address}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editShop('${shop.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteShop('${shop.id}')">Delete</button>
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
        console.error('Error loading shops:', error);
        container.innerHTML = '<p class="text-center">Error loading shops</p>';
    }
}

// Open add shop modal
function openAddShopModal() {
    currentShopId = null;
    document.getElementById('modalTitle').textContent = 'Add New Shop';
    document.getElementById('shopForm').reset();
    document.getElementById('shopModal').style.display = 'block';
}

// Edit shop
async function editShop(shopId) {
    currentShopId = shopId;
    document.getElementById('modalTitle').textContent = 'Edit Shop';

    // Load shop data and populate form
    // In production, fetch from Firebase

    document.getElementById('shopModal').style.display = 'block';
}

// Delete shop
async function deleteShop(shopId) {
    if (!confirm('Are you sure you want to delete this shop?')) {
        return;
    }

    try {
        await firebaseService.deleteDocument('shops', shopId);
        alert('Shop deleted successfully!');
        loadShops();
    } catch (error) {
        console.error('Error deleting shop:', error);
        alert('Error deleting shop');
    }
}

// Close modal
function closeModal() {
    document.getElementById('shopModal').style.display = 'none';
}

// Handle form submission
document.getElementById('shopForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const shopData = {
        name: document.getElementById('shopName').value,
        category: document.getElementById('shopCategory').value,
        phone: document.getElementById('shopPhone').value,
        address: document.getElementById('shopAddress').value,
        latitude: parseFloat(document.getElementById('shopLatitude').value) || 0,
        longitude: parseFloat(document.getElementById('shopLongitude').value) || 0,
        isActive: document.getElementById('shopStatus').value === 'true',
        createdAt: Date.now()
    };

    try {
        if (currentShopId) {
            await firebaseService.updateDocument('shops', currentShopId, shopData);
            alert('Shop updated successfully!');
        } else {
            await firebaseService.addDocument('shops', shopData);
            alert('Shop added successfully!');
        }

        closeModal();
        loadShops();
    } catch (error) {
        console.error('Error saving shop:', error);
        alert('Error saving shop');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadShops();
    }
});