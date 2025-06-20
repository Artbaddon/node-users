class Navigation {
  constructor() {
    // Updated navigationItems array
    this.navigationItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "bi-house-door",
        url: "../dashboard/index.html",
        roles: ["user", "manager", "admin"],
        category: "main",
      },

      // Document Management
      {
        id: "document-types",
        label: "Document Types",
        icon: "bi-file-earmark-text",
        url: "../documentType/index.html",
        roles: ["user", "manager", "admin"],
        category: "documents",
      },

      // User Management
      {
        id: "web-users",
        label: "Web Users",
        icon: "bi-people",
        url: "../webUsers/index.html",
        roles: ["manager", "admin"],
        category: "users",
      },

      {
        id: "user-status",
        label: "User Status",
        icon: "bi-person-check",
        url: "../userStatus/index.html",
        roles: ["admin"],
        category: "users",
      },

      // Security & Access
      {
        id: "roles",
        label: "Roles",
        icon: "bi-shield-check",
        url: "../roles/index.html",
        roles: ["admin"],
        category: "security",
      },
      {
        id: "permissions",
        label: "Permissions",
        icon: "bi-key",
        url: "../permissions/index.html",
        roles: ["admin"],
        category: "security",
      },

      // System Administration
      {
        id: "modules",
        label: "System Modules",
        icon: "bi-grid-3x3-gap",
        url: "../modules/index.html",
        roles: ["admin"],
        category: "system",
      },
      {
        id: "api-tokens",
        label: "API Tokens",
        icon: "bi-key-fill",
        url: "../apiTokens/index.html",
        roles: ["admin"],
        category: "system",
      },
      {
        id: "profiles",
        label: "Profiles",
        icon: "bi-person",
        url: "../profiles/index.html",
        roles: ["admin"],
        category: "system",
      },
    ];
  }

  // Check if user has access to navigation item
  hasAccess(item) {
    // If Auth is not available or user not logged in, show basic navigation
    if (typeof Auth === "undefined" || !Auth.isLoggedIn()) {
      return ["dashboard", "document-types"].includes(item.id);
    }

    try {
      // Check roles - if no roles specified, allow access
      if (item.roles.length === 0) {
        return true;
      }

      // Check if user has any of the required roles
      const userRoles = Auth.getUserRoles();
      if (!userRoles || userRoles.length === 0) {
        return false;
      }

      const hasRole = userRoles.some(
        (userRole) =>
          item.roles.includes(userRole.name) ||
          item.roles.includes(userRole.name.toLowerCase()) ||
          item.roles.includes("user") // Everyone can see user-level items
      );

      return hasRole;
    } catch (error) {
      console.warn("Error checking navigation access:", error);
      // Fallback: show basic navigation
      return ["dashboard", "document-types"].includes(item.id);
    }
  }

  // Get current page from URL
  getCurrentPage() {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);

    if (segments.length >= 2) {
      return segments[segments.length - 2];
    }

    return "dashboard";
  }

  // Set active navigation item
  setActiveItem() {
    const currentPage = this.getCurrentPage();

    this.navigationItems.forEach((item) => {
      item.active =
        item.url.includes(currentPage) ||
        (currentPage === "documentType" && item.id === "document-types") ||
        (currentPage === "dashboard" && item.id === "dashboard");
    });
  }

  // Generate navigation HTML
  generateNavigation() {
    this.setActiveItem();

    const accessibleItems = this.navigationItems.filter((item) =>
      this.hasAccess(item)
    );

    if (accessibleItems.length === 0) {
      return `
        <li class="nav-item">
          <a href="../dashboard/index.html" class="nav-link text-white">
            <i class="bi bi-house-door me-2"></i>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a href="../documentType/index.html" class="nav-link active">
            <i class="bi bi-file-earmark-text me-2"></i>Document Types
          </a>
        </li>
      `;
    }

    return accessibleItems
      .map((item) => {
        const activeClass = item.active ? "active" : "text-white";

        return `
        <li class="nav-item">
          <a href="${item.url}" class="nav-link ${activeClass}">
            <i class="bi ${item.icon} me-2"></i>${item.label}
          </a>
        </li>
      `;
      })
      .join("");
  }

  // Static method for easy initialization
  static init() {
    console.log("🧭 Navigation.init() called");

    const navigationContainer = document.getElementById("main-navigation");
    if (!navigationContainer) {
      console.warn("❌ Navigation container #main-navigation not found");
      return;
    }

    try {
      const nav = new Navigation();
      const navigationHTML = nav.generateNavigation();
      navigationContainer.innerHTML = navigationHTML;

      console.log("✅ Navigation rendered successfully");

      // Update user info
      nav.updateUserInfo();
    } catch (error) {
      console.error("❌ Error initializing navigation:", error);
      // Fallback navigation
      navigationContainer.innerHTML = `
        <li class="nav-item">
          <a href="../dashboard/index.html" class="nav-link text-white">
            <i class="bi bi-house-door me-2"></i>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a href="../documentType/index.html" class="nav-link active">
            <i class="bi bi-file-earmark-text me-2"></i>Document Types
          </a>
        </li>
      `;
    }
  }

  // Update user information in navbar
  updateUserInfo() {
    try {
      const userNameElements = document.querySelectorAll(".user-name");
      userNameElements.forEach((element) => {
        if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {
          const user = Auth.getUser();
          const name = user?.username || user?.email || "User";
          element.textContent = name;
        } else {
          element.textContent = "Guest";
        }
      });
    } catch (error) {
      console.warn("Error updating user info:", error);
    }
  }
}

// ❌ REMOVE AUTOMATIC INITIALIZATION - Let controller handle it
