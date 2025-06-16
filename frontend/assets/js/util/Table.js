class DataTableComponent {
  constructor(config) {
    this.config = {
      tableId: config.tableId,
      apiUrl: config.apiUrl,
      columns: config.columns,
      actions: config.actions || ['view', 'edit', 'delete'],
      requiredPermissions: config.requiredPermissions || [],
      entityName: config.entityName || 'Item',
      modalId: config.modalId || 'modal-form',
      ...config
    };
    
    this.table = null;
    this.data = [];
    this.init();
  }

  async init() {
    // Check permissions
    if (!this.hasRequiredPermissions()) {
      this.showAccessDenied();
      return;
    }

    // Initialize DataTable
    this.initializeDataTable();
    
    // Load data
    await this.loadData();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  hasRequiredPermissions() {
    if (this.config.requiredPermissions.length === 0) return true;
    return Auth.hasAnyPermission(this.config.requiredPermissions);
  }

  showAccessDenied() {
    const tableContainer = document.querySelector(`#${this.config.tableId}`);
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="alert alert-warning text-center">
          <i class="bi bi-exclamation-triangle"></i>
          You don't have permission to view this content.
        </div>
      `;
    }
  }
  initializeDataTable() {
    // Check if DataTable is already initialized and destroy it
    const tableElement = document.querySelector(`#${this.config.tableId}`);
    if (tableElement && $.fn.DataTable.isDataTable(tableElement)) {
      console.log('🔄 Destroying existing DataTable before reinitializing...');
      $(tableElement).DataTable().destroy();
    }
    
    const columnDefs = this.buildColumnDefinitions();
    
    this.table = new DataTable(`#${this.config.tableId}`, {
      columns: columnDefs,
      responsive: true,
      pageLength: 5,
      lengthMenu: [5, 10, 15, 20],
      order: [[0, 'asc']],
      language: {
        emptyTable: `No ${this.config.entityName.toLowerCase()}s found`,
        loadingRecords: "Loading...",
        processing: "Processing...",
        search: "Search:",
        lengthMenu: "Show _MENU_ entries",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        paginate: {
          first: "First",
          last: "Last",
          next: "Next",
          previous: "Previous"
        }
      },
      drawCallback: () => {
        // Re-setup event listeners after each draw
        this.setupRowEventListeners();
      }
    });
  }

  buildColumnDefinitions() {
    const columns = this.config.columns.map(col => ({
      title: col.label,
      data: col.key,
      orderable: col.sortable !== false,
      render: col.render || null,
      className: col.className || ''
    }));

    // Add actions column if actions are configured
    if (this.config.actions.length > 0) {
      columns.push({
        title: 'Actions',
        data: null,
        orderable: false,
        className: 'text-center',
        render: (data, type, row) => this.renderActionButtons(row)
      });
    }

    return columns;
  }
  renderActionButtons(row) {
    console.log('🔧 Rendering action buttons for row:', row);
    console.log('🔧 Available actions:', this.config.actions);
    
    const buttons = [];
    
    if (this.config.actions.includes('view') && this.canPerformAction('view')) {
      console.log('✅ Adding view button');
      buttons.push(`
        <button class="btn btn-sm btn-outline-secondary me-1 view-btn" 
                data-id="${row.id}" 
                data-bs-toggle="modal" 
                data-bs-target="#${this.config.modalId}"
                title="View ${this.config.entityName}">
          <i class="bi bi-eye"></i>
        </button>
      `);
    } else {
      console.log('❌ View button not added - action check failed');
    }

    if (this.config.actions.includes('edit') && this.canPerformAction('edit')) {
      console.log('✅ Adding edit button');
      buttons.push(`
        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" 
                data-id="${row.id}"
                data-bs-toggle="modal" 
                data-bs-target="#${this.config.modalId}"
                title="Edit ${this.config.entityName}">
          <i class="bi bi-pencil"></i>
        </button>
      `);
    } else {
      console.log('❌ Edit button not added - action check failed');
    }

    if (this.config.actions.includes('delete') && this.canPerformAction('delete')) {
      console.log('✅ Adding delete button');
      buttons.push(`
        <button class="btn btn-sm btn-outline-danger delete-btn" 
                data-id="${row.id}"
                title="Delete ${this.config.entityName}">
          <i class="bi bi-trash"></i>
        </button>
      `);
    } else {
      console.log('❌ Delete button not added - action check failed');
    }

    const result = buttons.join('');
    console.log('🔧 Final button HTML:', result);
    return result;
  }
  canPerformAction(action) {
    // For now, allow all actions for authenticated users
    // TODO: Implement proper permission checking later
    if (!Auth.isLoggedIn()) {
      return false;
    }
    
    // Check if user has admin role (bypass permission check)
    if (Auth.hasRole('Admin') || Auth.hasRole('admin') || Auth.hasRole('super_admin')) {
      return true;
    }
    
    // Try the specific permission first
    const permission = `${this.config.entityName.toLowerCase()}:${action}`;
    if (Auth.hasPermission && Auth.hasPermission(permission)) {
      return true;
    }
    
    // Fallback: allow basic actions for logged-in users
    return true;
  }

  async loadData() {
    try {
      this.showLoading(true);
      
      const token = Auth.getToken();
      const response = await fetch(this.config.apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Data loaded:', result.documentTypes);
      this.data = result.documentTypes;
      
      // Clear and reload table data
      this.table.clear();
      this.table.rows.add(this.data);
      this.table.draw();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  setupEventListeners() {
    // Create button listener
    const createBtn = document.querySelector('[data-bs-target="#' + this.config.modalId + '"]');
    if (createBtn && !createBtn.classList.contains('view-btn') && !createBtn.classList.contains('edit-btn')) {
      createBtn.addEventListener('click', () => this.handleCreate());
    }

    // Setup row-specific listeners
    this.setupRowEventListeners();
  }

  setupRowEventListeners() {
    // View button listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.handleView(id);
      });
    });

    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.handleEdit(id);
      });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.handleDelete(id);
      });
    });
  }

  handleCreate() {
    console.log('Create new', this.config.entityName);
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('table:create', {
      detail: { entityName: this.config.entityName }
    }));
  }

  handleView(id) {
    const item = this.data.find(row => row.id == id);
    console.log('View', this.config.entityName, id, item);
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('table:view', {
      detail: { id, item, entityName: this.config.entityName }
    }));
  }

  handleEdit(id) {
    const item = this.data.find(row => row.id == id);
    console.log('Edit', this.config.entityName, id, item);
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('table:edit', {
      detail: { id, item, entityName: this.config.entityName }
    }));
  }

  async handleDelete(id) {
    const item = this.data.find(row => row.id == id);
    const itemName = item?.name || item?.title || `${this.config.entityName} #${id}`;
    
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const token = Auth.getToken();
      const response = await fetch(`${this.config.apiUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Reload data
      await this.loadData();
      
      // Show success message
      this.showSuccess(`${this.config.entityName} deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showError('Failed to delete: ' + error.message);
    }
  }

  showLoading(show) {
    const tableContainer = document.querySelector(`#${this.config.tableId}_wrapper`);
    if (!tableContainer) return;

    if (show) {
      if (!document.querySelector('.loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
          <div class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Loading ${this.config.entityName.toLowerCase()}s...</div>
          </div>
        `;
        overlay.style.cssText = `
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.8); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        `;
        tableContainer.style.position = 'relative';
        tableContainer.appendChild(overlay);
      }
    } else {
      const overlay = document.querySelector('.loading-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }

  showError(message) {
    this.showNotification(message, 'danger');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);
  }

  // Public methods
  refresh() {
    return this.loadData();
  }

  getData() {
    return this.data;
  }

  getSelectedRow(id) {
    return this.data.find(row => row.id == id);
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {
    // Make table globally accessible for onclick events
    window.documentTypeTable = new DataTableComponent({
      tableId: 'data-table',
      apiUrl: API_CONFIG.getFullUrl(API_ENDPOINTS.DOCUMENT_TYPE.LIST),
      columns: [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" }
      ],
      entityName: 'Document Type',
      modalId: 'modal-form'
    });

    // Handle form submission
    document
      .getElementById("documentTypeForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        window.documentTypeTable.save();
      });

    // Handle create button
    document
      .querySelector('[data-bs-target="#modal-form"]')
      .addEventListener("click", () => {
        window.documentTypeTable.showModal(null, "create");
      });

    // Clean up modal backdrop when hidden
    document
      .getElementById("modal-form")
      .addEventListener("hidden.bs.modal", () => {
        // Remove any leftover backdrops
        const backdrops = document.querySelectorAll(".modal-backdrop");
        backdrops.forEach((backdrop) => backdrop.remove());

        // Reset body overflow
        document.body.style.overflow = "";
        document.body.classList.remove("modal-open");
      });
  } else {
    console.log("User not authenticated, redirecting...");
    window.location.href = "../../views/login/index.html";
  }
});
