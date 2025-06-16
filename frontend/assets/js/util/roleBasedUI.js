// Role-based UI utility functions
// This utility helps you show/hide elements based on user roles and permissions

class RoleBasedUI {
  
  // Hide/show elements based on roles
  static showForRoles(elementSelector, allowedRoles) {
    const elements = document.querySelectorAll(elementSelector);
    const hasAccess = Auth.hasAnyRole(allowedRoles);
    
    elements.forEach(element => {
      if (hasAccess) {
        element.style.display = '';
        element.classList.remove('d-none');
      } else {
        element.style.display = 'none';
        element.classList.add('d-none');
      }
    });
  }

  // Hide/show elements based on permissions
  static showForPermissions(elementSelector, requiredPermissions) {
    const elements = document.querySelectorAll(elementSelector);
    const hasAccess = Auth.hasAnyPermission(requiredPermissions);
    
    elements.forEach(element => {
      if (hasAccess) {
        element.style.display = '';
        element.classList.remove('d-none');
      } else {
        element.style.display = 'none';
        element.classList.add('d-none');
      }
    });
  }

  // Enable/disable buttons based on roles
  static enableForRoles(elementSelector, allowedRoles) {
    const elements = document.querySelectorAll(elementSelector);
    const hasAccess = Auth.hasAnyRole(allowedRoles);
    
    elements.forEach(element => {
      element.disabled = !hasAccess;
      if (!hasAccess) {
        element.classList.add('disabled');
        element.title = 'You do not have permission to perform this action';
      } else {
        element.classList.remove('disabled');
        element.title = '';
      }
    });
  }
  // Initialize role-based UI when page loads
  static initializeRoleBasedUI() {
    // Example: Show admin-only elements
    this.showForRoles('.admin-only', ['Admin', 'super_admin']);
    
    // Example: Show manager-only elements  
    this.showForRoles('.manager-only', ['manager', 'Admin', 'super_admin']);
    
    // Example: Show user elements (everyone)
    this.showForRoles('.user-only', ['user', 'manager', 'Admin', 'super_admin']);
    
    // Commented out automatic button disabling to prevent conflicts with DataTable
    this.enableForRoles('.delete-btn', ['Admin', 'super_admin']);
    this.enableForRoles('.edit-btn', ['manager', 'Admin', 'super_admin']);
    
    // Show current user info
    this.displayUserInfo();
  }

  // Display current user information
  static displayUserInfo() {
    const user = Auth.getUser();
    if (!user) return;

    // Update user name displays
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = Auth.getUserFullName();
    });

    // Update user roles displays
    document.querySelectorAll('.user-roles').forEach(el => {
      const roles = Auth.getUserRoles().map(r => r.name).join(', ');
      el.textContent = roles || 'No roles assigned';
    });

    // Update user photo
    document.querySelectorAll('.user-photo').forEach(el => {
      const photoUrl = Auth.getUserPhoto();
      if (photoUrl) {
        el.src = photoUrl;
      }
    });

    // Update role badges
    const rolesContainer = document.querySelector('.user-role-badges');
    if (rolesContainer) {
      rolesContainer.innerHTML = '';
      Auth.getUserRoles().forEach(role => {
        const badge = document.createElement('span');
        badge.className = 'badge badge-primary me-1';
        badge.textContent = role.name;
        rolesContainer.appendChild(badge);
      });
    }
  }

  // Check if user can access a specific page/feature
  static canAccess(requiredRoles = [], requiredPermissions = []) {
    if (requiredRoles.length > 0 && !Auth.hasAnyRole(requiredRoles)) {
      return false;
    }
    
    if (requiredPermissions.length > 0 && !Auth.hasAnyPermission(requiredPermissions)) {
      return false;
    }
    
    return true;
  }

  // Redirect if user doesn't have access
  static requireAccess(requiredRoles = [], requiredPermissions = [], redirectUrl = '/unauthorized.html') {
    if (!this.canAccess(requiredRoles, requiredPermissions)) {
      alert('You do not have permission to access this page.');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
}

// Auto-initialize when DOM is loaded (after auth check)
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for auth to be processed
  setTimeout(() => {
    if (Auth.isLoggedIn()) {
      RoleBasedUI.initializeRoleBasedUI();
    }
  }, 100);
});
