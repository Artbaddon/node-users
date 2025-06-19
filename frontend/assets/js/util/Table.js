class DataTableComponent {
  constructor(config) {
    console.log('📊 DataTable config received:', config);
    this.config = config;
    this.table = null;
    this.data = [];
    this.init();
  }

  async init() {
    this.initializeDataTable();
    await this.loadData();
    this.setupEventListeners();
  }

  initializeDataTable() {
    const tableElement = document.querySelector(`#${this.config.tableId}`);
    
    // Destroy existing table
    if (tableElement && $.fn.DataTable.isDataTable(tableElement)) {
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
        search: "Search:",
        lengthMenu: "Show _MENU_ entries"
      },
      drawCallback: () => this.setupRowEventListeners()
    });
  }
  buildColumnDefinitions() {
    if (!this.config.columns || !Array.isArray(this.config.columns)) {
      console.error('❌ Table configuration missing columns array:', this.config);
      throw new Error('Table configuration must include a columns array');
    }

    const columns = this.config.columns.map(col => ({
      title: col.label,
      data: col.key,
      orderable: col.sortable !== false,
      render: col.render || null,
      className: col.className || ''
    }));

    // Add actions column
    if (this.config.actions && this.config.actions.length > 0) {
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
    const buttons = [];
    
    if (this.config.actions.includes('view')) {
      buttons.push(`
        <button class="btn btn-sm btn-outline-secondary me-1 view-btn" 
                data-id="${row.id}" title="View">
          <i class="bi bi-eye"></i>
        </button>
      `);
    }

    if (this.config.actions.includes('edit')) {
      buttons.push(`
        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" 
                data-id="${row.id}" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
      `);
    }

    if (this.config.actions.includes('delete')) {
      buttons.push(`
        <button class="btn btn-sm btn-outline-danger delete-btn" 
                data-id="${row.id}" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      `);
    }

    console.log(`🔧 Rendered actions for row ${row.id}:`, buttons.length, 'buttons');
    return buttons.join('');
  }
  async loadData() {
    console.log('📊 Loading data from:', this.config.apiUrl);
    try {
      const token = Auth.getToken();
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(this.config.apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📄 API response:', result);      // Handle different response formats
      this.data = result.data || result.documentTypes || result.users || result.roles || result.permissions || [];
      console.log('📋 Loaded data:', this.data.length, 'items');
      
      if (this.data.length > 0) {
        console.log('📄 Sample data item:', this.data[0]);
        console.log('📋 Available fields:', Object.keys(this.data[0]));
      }
      
      this.table.clear();
      this.table.rows.add(this.data);
      this.table.draw();
      
      console.log('✅ Data loaded and table updated');
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showError('Failed to load data: ' + error.message);
    }
  }

  setupEventListeners() {
    const createBtn = document.querySelector(`[data-bs-target="#${this.config.modalId}"]`);
    if (createBtn) {
      createBtn.addEventListener('click', () => this.handleCreate());
    }
    this.setupRowEventListeners();
  }  setupRowEventListeners() {
    // Use event delegation for dynamically created buttons
    const tableElement = document.getElementById(this.config.tableId);
    if (!tableElement) {
      console.error('❌ Table element not found:', this.config.tableId);
      return;
    }

    console.log('🔧 Setting up event listeners for table:', this.config.tableId);

    // Remove existing delegated listeners to prevent duplicates
    const oldHandler = tableElement._actionHandler;
    if (oldHandler) {
      tableElement.removeEventListener('click', oldHandler);
    }

    // Create new delegated event handler
    const actionHandler = (e) => {
      console.log('🖱️ Table click detected:', e.target);
      
      const button = e.target.closest('.view-btn, .edit-btn, .delete-btn');
      if (!button) {
        console.log('❌ No action button found');
        return;
      }

      console.log('✅ Action button found:', button.className);
      
      const id = button.dataset.id;
      if (!id) {
        console.error('❌ No ID found on button:', button);
        return;
      }

      console.log('🔑 Button ID:', id);

      if (button.classList.contains('view-btn')) {
        console.log('👁️ Handling view for ID:', id);
        this.handleView(id);
      } else if (button.classList.contains('edit-btn')) {
        console.log('✏️ Handling edit for ID:', id);
        this.handleEdit(id);
      } else if (button.classList.contains('delete-btn')) {
        console.log('🗑️ Handling delete for ID:', id);
        this.handleDelete(id);
      }
    };

    // Store reference for later removal
    tableElement._actionHandler = actionHandler;
    tableElement.addEventListener('click', actionHandler);
    
    console.log(`✅ Event listeners set up for ${this.config.entityName} table`);
  }

  handleCreate() {
    document.dispatchEvent(new CustomEvent('table:create', {
      detail: { entityName: this.config.entityName }
    }));
  }
  handleView(id) {
    console.log('🔍 HandleView called with ID:', id);
    const item = this.data.find(row => row.id == id);
    console.log('📄 Found item:', item);
    
    const eventDetail = { id, item, entityName: this.config.entityName };
    console.log('📤 Dispatching table:view event:', eventDetail);
    
    document.dispatchEvent(new CustomEvent('table:view', {
      detail: eventDetail
    }));
  }

  handleEdit(id) {
    console.log('✏️ HandleEdit called with ID:', id);
    const item = this.data.find(row => row.id == id);
    console.log('📄 Found item:', item);
    
    const eventDetail = { id, item, entityName: this.config.entityName };
    console.log('📤 Dispatching table:edit event:', eventDetail);
    
    document.dispatchEvent(new CustomEvent('table:edit', {
      detail: eventDetail
    }));
  }

  async handleDelete(id) {
    const item = this.data.find(row => row.id == id);
    const itemName = item?.name || item?.username || `${this.config.entityName} #${id}`;
    
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

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

      await this.loadData();
      this.showSuccess(`${this.config.entityName} deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showError('Failed to delete: ' + error.message);
    }
  }

  showError(message) {
    this.showNotification(message, 'danger');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  refresh() {
    return this.loadData();
  }

  getData() {
    return this.data;
  }
}

// DataTableComponent class can be used by any module
// Initialization is handled by individual modules, not here automatically
