// Common JavaScript Functions

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyDUIQGpAFQQreAU9Pz-A0V_sz6Ajw5og6g",
        authDomain: "bastiseva-c5a6a.firebaseapp.com",
        projectId: "bastiseva-c5a6a",
        storageBucket: "bastiseva-c5a6a.firebasestorage.app",
        messagingSenderId: "784869695830",
        appId: "1:784869695830:web:f6fd89a2079bf0a388f6f7"
    };
    firebase.initializeApp(firebaseConfig);
}
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;

// Check authentication
function checkAuth(callback) {
    if (!auth) {
        window.location.href = 'index.html';
        return;
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            if (callback) callback(user);
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (auth) {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Logout Error:', error);
                alert('Error logging out.');
            });
        }
    }
}

// Format date
function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
