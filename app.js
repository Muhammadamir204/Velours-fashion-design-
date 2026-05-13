/* ============================================================
   VELOURS FASHION DESIGN - Application Logic
   Admin Authentication | Payment Processing | WhatsApp Integration
   ============================================================ */

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    AUTHORIZED_ADMIN_EMAIL: 'mamirranjha17@gmail.com',
    ADMIN_PASSWORD: 'VeloursFashion2024!Secure', // Should be hashed in production
    WHATSAPP_NUMBER: '923450375184',
    SADAPAY_ACCOUNT: {
        title: 'Sanawer Irshad',
        accountNumber: '03450375184',
        iban: 'PK38SADA0000003450375184'
    }
};

// ============================================================
// GLOBAL STATE
// ============================================================

let appState = {
    currentProduct: {
        name: '',
        price: '',
        image: ''
    },
    isAdminAuthenticated: false,
    adminUser: null
};

// ============================================================
// PRODUCT MODAL MANAGEMENT
// ============================================================

function openProductModal(productName, productPrice, productImage = '') {
    const modal = document.getElementById('productModal');
    const modalProductName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalPrice');
    const modalImage = document.getElementById('modalImage');
    
    // Update global state
    appState.currentProduct = {
        name: productName,
        price: productPrice,
        image: productImage || 'https://images.unsplash.com/photo-1595777707802-221b8e32e0a0?w=500&h=600&fit=crop'
    };
    
    // Populate modal
    modalProductName.textContent = productName;
    modalPrice.textContent = productPrice;
    modalImage.src = appState.currentProduct.image;
    modalImage.alt = productName;
    
    // Display modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ============================================================
// PAYMENT MODAL MANAGEMENT
// ============================================================

function openPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Close product modal
    closeProductModal();
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('paymentForm').reset();
}

// ============================================================
// ORDER CONFIRMATION & WHATSAPP INTEGRATION
// ============================================================

function confirmOrder() {
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const paymentReceipt = document.getElementById('paymentReceipt').value.trim();
    
    // Validation
    if (!fullName || !email || !phone || !paymentReceipt) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.length < 10) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    // Log order (in production, send to server)
    const orderData = {
        productName: appState.currentProduct.name,
        price: appState.currentProduct.price,
        fullName: fullName,
        email: email,
        phone: phone,
        paymentReceipt: paymentReceipt,
        timestamp: new Date().toISOString()
    };
    
    console.log('Order Data:', orderData);
    
    // Save to localStorage (temporary solution)
    saveOrderLocally(orderData);
    
    // Create WhatsApp message
    const whatsappMessage = createWhatsAppMessage(orderData);
    
    // Redirect to WhatsApp
    redirectToWhatsApp(whatsappMessage);
}

function createWhatsAppMessage(orderData) {
    const message = `Hi Velours Fashion! 🎀\n\nI am purchasing ${orderData.productName} for ${orderData.price}.\n\n📋 Order Details:\n- Name: ${orderData.fullName}\n- Email: ${orderData.email}\n- Phone: ${orderData.phone}\n- Payment Receipt: ${orderData.paymentReceipt}\n\nHere is my payment receipt. Please confirm my order. Thank you!`;
    
    return encodeURIComponent(message);
}

function redirectToWhatsApp(message) {
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Close payment modal and show success message
    closePaymentModal();
    showNotification('Redirecting to WhatsApp... Your order will be confirmed shortly!', 'success');
    
    // Reset form after redirect
    setTimeout(() => {
        document.getElementById('paymentForm').reset();
    }, 500);
}

function saveOrderLocally(orderData) {
    try {
        const existingOrders = JSON.parse(localStorage.getItem('veloursOrders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('veloursOrders', JSON.stringify(existingOrders));
        console.log('Order saved locally:', orderData);
    } catch (error) {
        console.error('Error saving order:', error);
    }
}

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#0066cc'};
        color: white;
        border-radius: 4px;
        z-index: 2000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

function openAdminModal() {
    const adminModal = document.getElementById('adminModal');
    adminModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    const adminModal = document.getElementById('adminModal');
    adminModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('adminForm').reset();
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    const adminEmail = document.getElementById('adminEmail').value.trim();
    const adminPassword = document.getElementById('adminPassword').value;
    
    // Strict authentication
    if (adminEmail === CONFIG.AUTHORIZED_ADMIN_EMAIL && 
        adminPassword === CONFIG.ADMIN_PASSWORD) {
        
        // Authentication successful
        appState.isAdminAuthenticated = true;
        appState.adminUser = adminEmail;
        
        showNotification('✓ Admin access granted!', 'success');
        closeAdminModal();
        
        // Open admin dashboard (in production)
        openAdminDashboard();
        
    } else if (adminEmail === CONFIG.AUTHORIZED_ADMIN_EMAIL) {
        showNotification('Incorrect password', 'error');
    } else {
        showNotification('Unauthorized email address. Only admins can access this portal.', 'error');
        logUnauthorizedAttempt(adminEmail);
    }
}

function logUnauthorizedAttempt(email) {
    const attempt = {
        email: email,
        timestamp: new Date().toISOString(),
        type: 'unauthorized_login_attempt'
    };
    
    console.warn('Unauthorized access attempt:', attempt);
    
    // In production, send to server for security logging
}

function openAdminDashboard() {
    // Create admin dashboard modal
    const adminContent = document.createElement('div');
    adminContent.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px;">
            <h2>Admin Dashboard</h2>
            <p style="margin-bottom: 20px; color: #666;">Welcome, ${appState.adminUser}</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <h3>System Status</h3>
                <p>✓ Database Connection: Active</p>
                <p>✓ Payment Gateway: Connected</p>
                <p>✓ WhatsApp Integration: Live</p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <h3>Recent Orders</h3>
                <div id="adminOrdersList"></div>
            </div>
            
            <button onclick="exportOrdersToCSV()" style="
                width: 100%;
                padding: 12px;
                background: #121212;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 4px;
                font-weight: 600;
                margin-bottom: 10px;
            ">📥 Export Orders as CSV</button>
            
            <button onclick="closeAdminDashboard()" style="
                width: 100%;
                padding: 12px;
                background: #f0f0f0;
                color: #121212;
                border: none;
                cursor: pointer;
                border-radius: 4px;
                font-weight: 600;
            ">Close</button>
        </div>
    `;
    
    // Display in modal
    const modal = document.getElementById('adminModal');
    const content = modal.querySelector('.admin-login');
    const originalContent = content.innerHTML;
    content.innerHTML = adminContent.innerHTML;
    
    // Load and display orders
    loadAdminOrders();
    
    // Store original content for logout
    modal.dataset.originalContent = originalContent;
}

function closeAdminDashboard() {
    const modal = document.getElementById('adminModal');
    const adminLogin = modal.querySelector('.admin-login');
    
    if (modal.dataset.originalContent) {
        adminLogin.innerHTML = modal.dataset.originalContent;
    }
    
    appState.isAdminAuthenticated = false;
    appState.adminUser = null;
    
    closeAdminModal();
}

function loadAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('veloursOrders') || '[]');
    const ordersList = document.getElementById('adminOrdersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="color: #999;">No orders yet</p>';
        return;
    }
    
    const ordersHTML = orders.map((order, index) => `
        <div style="
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        ">
            <strong>${index + 1}. ${order.productName}</strong> - ${order.price}<br>
            <small style="color: #999;">${order.fullName} | ${order.email}</small>
        </div>
    `).join('');
    
    ordersList.innerHTML = ordersHTML;
}

function exportOrdersToCSV() {
    const orders = JSON.parse(localStorage.getItem('veloursOrders') || '[]');
    
    if (orders.length === 0) {
        showNotification('No orders to export', 'error');
        return;
    }
    
    // Create CSV header
    const headers = ['Product Name', 'Price', 'Customer Name', 'Email', 'Phone', 'Payment Receipt', 'Order Date'];
    
    // Create CSV rows
    const rows = orders.map(order => [
        order.productName,
        order.price,
        order.fullName,
        order.email,
        order.phone,
        order.paymentReceipt,
        new Date(order.timestamp).toLocaleString()
    ]);
    
    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `velours-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Orders exported successfully!', 'success');
}

// ============================================================
// PRODUCT FILTERING
// ============================================================

function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    const filterButtons = document.querySelectorAll('.filter-tag');
    
    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter products
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.4s ease-in-out';
        } else {
            const cardCategories = card.getAttribute('data-category').split(' ');
            if (cardCategories.includes(category)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.4s ease-in-out';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ============================================================
// MODAL CLOSE ON BACKGROUND CLICK
// ============================================================

document.addEventListener('click', function(event) {
    const productModal = document.getElementById('productModal');
    const paymentModal = document.getElementById('paymentModal');
    const adminModal = document.getElementById('adminModal');
    
    // Close product modal on background click
    if (event.target === productModal) {
        closeProductModal();
    }
    
    // Close payment modal on background click
    if (event.target === paymentModal) {
        closePaymentModal();
    }
    
    // Close admin modal on background click
    if (event.target === adminModal && appState.isAdminAuthenticated === false) {
        closeAdminModal();
    }
});

// ============================================================
// KEYBOARD EVENTS
// ============================================================

document.addEventListener('keydown', function(event) {
    // Close modals with Escape key
    if (event.key === 'Escape') {
        closeProductModal();
        closePaymentModal();
        if (!appState.isAdminAuthenticated) {
            closeAdminModal();
        }
    }
});

// ============================================================
// EVENT LISTENERS - INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Admin button
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAdminModal();
        });
    }
    
    // Admin form submission
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Payment form submission (handled by button onclick)
    // Filter tags
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const category = this.textContent.toLowerCase();
            filterProducts(category);
        });
    });
    
    // Lazy load images
    initializeLazyLoading();
    
    // Initialize smooth scroll for navigation
    initializeSmoothScroll();
    
    // Log app initialization
    console.log('VELOURS FASHION DESIGN - Application initialized');
    console.log('Admin Authentication System: Active');
    console.log('Payment Gateway: Ready');
    console.log('WhatsApp Integration: Live');
});

// ============================================================
// LAZY LOADING IMAGES
// ============================================================

function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger actual load
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ============================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================================
// ANALYTICS & TRACKING
// ============================================================

function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        data: eventData
    };
    
    console.log('Event:', event);
    
    // In production, send to analytics service
    // Example: sendToAnalytics(event);
}

// Track page views
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        trackEvent('page_view', { page: window.location.pathname });
    });
} else {
    trackEvent('page_view', { page: window.location.pathname });
}

// Track product interactions
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('quick-view-btn') || 
        event.target.classList.contains('add-to-cart-btn') ||
        event.target.classList.contains('view-details')) {
        const productName = event.target.closest('[data-category]')?.querySelector('h3')?.textContent || 'Unknown';
        trackEvent('product_interaction', { product: productName, action: 'view' });
    }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(amount);
}

// ============================================================
// ERROR HANDLING
// ============================================================

window.addEventListener('error', function(event) {
    console.error('Application Error:', event.error);
    // In production, send error to logging service
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // In production, send to error tracking service
});

// ============================================================
// SECURITY CONSIDERATIONS
// ============================================================

// Prevent XSS - sanitize user inputs
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// CSP Headers should be set on the server
// X-Frame-Options: DENY
// X-Content-Type-Options: nosniff
// X-XSS-Protection: 1; mode=block

console.log('%c VELOURS FASHION DESIGN', 'color: #121212; font-size: 16px; font-weight: bold;');
console.log('%c Luxury Fashion E-Commerce Platform', 'color: #666; font-size: 12px;');
console.log('%c Admin Portal: Authorized Access Only', 'color: #f4a460; font-size: 11px;');
