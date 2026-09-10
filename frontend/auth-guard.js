// auth-guard.js
(function enforceSecurity() {
  const token = localStorage.getItem('medifind-token');
  const userStr = localStorage.getItem('medifind-user');
  
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // 1. If NO token, immediately kick to login page (unless already on auth pages)
  if (!token || !userStr) {
    if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
      window.location.replace('login.html');
    }
    return;
  }

  // 2. Define allowed roles for each page
  // 2. Define allowed roles for each page
  const PAGE_ACCESS = {
    'admin-console.html': ['ADMIN', 'SUPER_ADMIN'],
    'pharmacy-dashboard.html': ['OWNER', 'ADMIN', 'SUPER_ADMIN'],
    'pharmacist-desk.html': ['PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'],
    
    // UPDATED: Pharmacists and Owners are no longer allowed here
    'index.html': ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] 
  };
  // 3. Check role permissions
  try {
    const user = JSON.parse(userStr);
    const allowedRoles = PAGE_ACCESS[currentPage];

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      alert("Access Denied: You do not have permission to view this page.");
      
      const routes = {
        'CUSTOMER': 'index.html',
        'PHARMACIST': 'pharmacist-desk.html',
        'OWNER': 'pharmacy-dashboard.html',
        'ADMIN': 'admin-console.html',
        'SUPER_ADMIN': 'admin-console.html'
      };
      
      window.location.replace(routes[user.role] || 'index.html');
    }
  } catch (e) {
    // If user data is corrupted, force login
    localStorage.clear();
    window.location.replace('login.html');
  }
})();