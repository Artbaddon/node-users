//TODO validate if the user is logged in with localStorage
class Auth {
  static getToken() {
    return localStorage.getItem('token');
  }

  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static setUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  static setToken(token) {
    localStorage.setItem('token', token);
  }

  static isLoggedIn() {
    return !!(this.getToken() && this.getUser());
  }  // Helper method to get correct login path based on current location
  static getLoginPath() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/views/')) {
      return '../../views/login/index.html';
    }

    return '../views/login/index.html';
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = this.getLoginPath();
  }

  // Enhanced method: validate token with backend and sync user data
  static async validateToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:3000/api_v1/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token validated by backend:', data.message);
        
        // Update local user data with latest from backend
        this.setUser(data.user);
        
        return {
          valid: true,
          user: data.user,
          tokenInfo: data.token
        };
      } else {
        console.log('❌ Token validation failed:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('Error details:', errorData.message);
        
        this.logout(); // Clear invalid token
        return { valid: false, message: errorData.message || 'Token validation failed' };
      }
    } catch (error) {
      console.log('❌ Token validation error:', error);
      // Don't logout on network errors, assume token is still valid
      return { valid: true, networkError: true };
    }
  }
  // Updated requireAuth method with enhanced backend validation
  static async requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = this.getLoginPath();
      return false;
    }

    // Validate token with backend
    const validation = await this.validateToken();
    if (!validation.valid) {
      window.location.href = this.getLoginPath();
      return false;
    }

    return validation;
  }

  // Helper methods for accessing user data
  static getUserRoles() {
    const user = this.getUser();
    return user?.roles || [];
  }

  static getUserPermissions() {
    const user = this.getUser();
    return user?.permissions || [];
  }

  static hasRole(roleName) {
    const roles = this.getUserRoles();
    return roles.some(role => role.name === roleName);
  }

  static hasPermission(permissionName) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permissionName);
  }

  static hasAnyRole(roleNames) {
    return roleNames.some(roleName => this.hasRole(roleName));
  }

  static hasAnyPermission(permissionNames) {
    return permissionNames.some(permission => this.hasPermission(permission));
  }

  static getUserProfile() {
    const user = this.getUser();
    return user?.profile || {};
  }

  static getUserFullName() {
    const profile = this.getUserProfile();
    return profile.fullName || profile.firstName || this.getUser()?.username || 'User';
  }

  static getUserPhoto() {
    const profile = this.getUserProfile();
    return profile.photoUrl ? `http://localhost:3000${profile.photoUrl}` : null;
  }

  static getUserStatus() {
    const user = this.getUser();
    return user?.status || {};
  }

  static isUserActive() {
    const status = this.getUserStatus();
    return status.id === 1; // Assuming 1 is active status
  }

  // Method to refresh user data from backend
  static async refreshUserData() {
    const validation = await this.validateToken();
    if (validation.valid && validation.user) {
      this.setUser(validation.user);
      return validation.user;
    }
    return null;
  }
}

// Auto-check auth on page load with enhanced validation
document.addEventListener('DOMContentLoaded', async () => {
  // Skip auth check on login/register pages
  const isLoginPage = window.location.pathname.includes('login') || 
                     window.location.pathname.includes('register');
  
  if (!isLoginPage) {
    const validation = await Auth.requireAuth();
    
    if (validation && validation.valid) {
      // Optional: Display user info in UI
      console.log(`Welcome ${Auth.getUserFullName()}!`);
      console.log(`Roles: ${Auth.getUserRoles().map(r => r.name).join(', ')}`);
      console.log(`Permissions: ${Auth.getUserPermissions().slice(0, 5).join(', ')}${Auth.getUserPermissions().length > 5 ? '...' : ''}`);
      
      // You can add UI updates here, like showing user name in header
      const userNameElement = document.querySelector('#user-name');
      if (userNameElement) {
        userNameElement.textContent = Auth.getUserFullName();
      }
      
      const userPhotoElement = document.querySelector('#user-photo');
      if (userPhotoElement) {
        const photoUrl = Auth.getUserPhoto();
        if (photoUrl) {
          userPhotoElement.src = photoUrl;
        }
      }
    }
  }
});
