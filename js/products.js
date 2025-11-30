// Products Management JavaScript

let currentProductId = null;
let currentShopId = null;

// Load all products
async function loadProducts(filters = {}) {
    const container = document.getElementById('productsTableContainer');
    container.innerHTML = '<div class="loading">Loading products...</div>';

    try {
        let products = await firebaseService.getCollection('products');

        // Apply filters
        if (filters.shopId) {
            products = products.filter(p => p.shopId === filters.shopId);
        }
        if (filters.status) {
            products = products.filter(p => p.isAvailable === (filters.status === 'available'));
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.category.toLowerCase().includes(search)
            );
        }

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No products found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Shop</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(product => {
            const statusClass = product.isAvailable ? 'badge-available' : 'badge-unavailable';
            const statusText = product.isAvailable ? 'Available' : 'Unavailable';
            const imageUrl = product.imageUrl || 'https://via.placeholder.com/50';

            html += `
                <tr>
                    <td>#${product.id.substring(0, 8)}</td>
                    <td><img src="${imageUrl}" alt="${product.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;"></td>
                    <td>${product.name}</td>
                    <td>${product.shopName || 'N/A'}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>₹${product.price}</td>
                    <td>${product.unit}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
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
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="text-center">Error loading products</p>';
    }
}

// Load shops for dropdown
async function loadShopsDropdown() {
    try {
        const shops = await firebaseService.getCollection('shops');
        const selectElement = document.getElementById('productShop');

        if (selectElement) {
            shops.forEach(shop => {
                const option = document.createElement('option');
                option.value = shop.id;
                option.textContent = shop.name;
                selectElement.appendChild(option);
            });
        }

        // Also populate filter dropdown
        const filterSelect = document.querySelector('.search-bar select');
        if (filterSelect) {
            shops.forEach(shop => {
                const option = document.createElement('option');
                option.value = shop.id;
                option.textContent = shop.name;
                filterSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading shops dropdown:', error);
    }
}

// Open add product modal
function openAddProductModal() {
    currentProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
    document.getElementById('variantsContainer').innerHTML = '';
}

// Edit product
async function editProduct(productId) {
    currentProductId = productId;
    document.getElementById('modalTitle').textContent = 'Edit Product';

    try {
        // In production, fetch product data from Firebase
        const products = await firebaseService.getCollection('products');
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productShop').value = product.shopId;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productUnit').value = product.unit;
            document.getElementById('productImageUrl').value = product.imageUrl || '';
            document.getElementById('productStatus').value = product.isAvailable.toString();

            // Load variants if any
            if (product.variants && product.variants.length > 0) {
                const container = document.getElementById('variantsContainer');
                container.innerHTML = '';
                product.variants.forEach((variant, index) => {
                    addVariantField(variant.name, variant.price);
                });
            }
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }

    document.getElementById('productModal').style.display = 'block';
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await firebaseService.deleteDocument('products', productId);
        alert('Product deleted successfully!');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// Add variant field
function addVariantField(name = '', price = '') {
    const container = document.getElementById('variantsContainer');
    const variantIndex = container.children.length;

    const variantHtml = `
        <div class="variant-item" style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="variant-name" placeholder="Variant name (e.g., Half)" value="${name}" style="flex: 1;">
            <input type="number" class="variant-price" placeholder="Price" value="${price}" style="flex: 1;">
            <button type="button" onclick="removeVariant(this)" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">Remove</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', variantHtml);
}

// Remove variant field
function removeVariant(button) {
    button.parentElement.remove();
}

// Get variants data from form
function getVariantsData() {
    const variants = [];
    const variantItems = document.querySelectorAll('.variant-item');

    variantItems.forEach(item => {
        const name = item.querySelector('.variant-name').value.trim();
        const price = parseInt(item.querySelector('.variant-price').value);

        if (name && price) {
            variants.push({ name, price });
        }
    });

    return variants;
}

// Close modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Handle form submission
document.getElementById('productForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const variants = getVariantsData();

    const productData = {
        name: document.getElementById('productName').value,
        shopId: document.getElementById('productShop').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: parseInt(document.getElementById('productPrice').value),
        unit: document.getElementById('productUnit').value,
        imageUrl: document.getElementById('productImageUrl').value,
        variants: variants,
        isAvailable: document.getElementById('productStatus').value === 'true',
        createdAt: Date.now()
    };

    try {
        if (currentProductId) {
            await firebaseService.updateDocument('products', currentProductId, productData);
            alert('Product updated successfully!');
        } else {
            await firebaseService.addDocument('products', productData);
            alert('Product added successfully!');
        }

        closeModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
    }
});

// Handle search/filter
document.querySelector('.search-bar input')?.addEventListener('input', function(e) {
    const filters = {
        search: e.target.value,
        shopId: document.querySelector('.search-bar select:nth-of-type(1)').value,
        status: document.querySelector('.search-bar select:nth-of-type(2)').value
    };
    loadProducts(filters);
});

document.querySelectorAll('.search-bar select').forEach(select => {
    select.addEventListener('change', function() {
        const filters = {
            search: document.querySelector('.search-bar input').value,
            shopId: document.querySelector('.search-bar select:nth-of-type(1)').value,
            status: document.querySelector('.search-bar select:nth-of-type(2)').value
        };
        loadProducts(filters);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadProducts();
        loadShopsDropdown();
    }
});